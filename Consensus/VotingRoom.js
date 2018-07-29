const kue = require('kue');
const CodeModel = require('../Database/Code');
const CodeController = require('../Controllers/CodeController')(CodeModel);

/*
    Process the votes and handles the opening and closing of the votations.
    Each VotingRoom represents a different Session-TicketType.
*/
class VotingRoom {
    /*
        @room                       The socket room name.
        @broadcastVotationHandler   The handler that would broadcast a votation 
                                    to all nodes (given by the controller).   
        @closeVotationHandler       The handler that notifies the votationClose.
    */
    constructor( room, broadcastVotationHandler, closeVotationHandler ) {
        this.room = room;
        this.broadcastVotationHandler = broadcastVotationHandler;
        this.closeVotationHandler = closeVotationHandler;

        //Nodes in the room
        this.members = 0;
        this.voteCount = {};
        this.veredicts = {};
        this.activeCodes = {};
        
        //Time to wait until force the votation ending, when votes stop coming
        //(avoid high latency and deal with absent votations)
        this.votationTTL = 1000;
        //Stores the the job responsible for killing a votation
        this.votationKillers = {};
        //Stores the done callback of the open_votation kue job.
        this.votationEnders = {};
        //Max votations opened at same time (only when code to vote is not
        //already opened)
        this.concurrencyLevel = 20;
        //Time to wait when a code is already in a non closed votation and
        //a node tried to open a new votation
        this.duplicateCodeWaitTime = 100;

        //Queues to avoid race conditions and make background jobs
        //========================================================
        this.votationsToOpenQueue = kue.createQueue();
        this.votesQueue = kue.createQueue();
        //Forces the end of a votation (if votes stop coming or all nodes absent)
        this.votationKillersQueue = kue.createQueue(); 

        //OPEN A VOTATION
        this.votationsToOpenQueue.process( 'open_votation_' + this.room, this.concurrencyLevel, ( job, done ) => {
            this.openVotationHandler( job, done );
            console.time('votation_duration');
        });

        //PROCESS A VOTE
        this.votesQueue.process( 'vote_' + this.room, ( job, done ) => {
            console.log( job.data.votation );
            this.processVote( job.data.vote, job.data.votation );
            done();
        });

        //KILLS A VOTATION
        this.votationKillersQueue.process( 'kill_votation_' + this.room, ( job, done ) =>  {
            console.log( 'votation killer started: ' + this.getVotationId( job.data.votation ) );
            //If votation didn't already ended
            if( this.veredicts[ this.getVotationId( job.data.votation ) ] ) {
                this.closeVotation( job.data.votation );
            } else {
                console.log( 'attempted to kill and ended votation' );
            }

            delete this.votationKillers[ this.getVotationId( job.data.votation ) ];
            done();
        });
    }

    memberJoined() {
        this.members++;
        console.log( 'Someone joined ' + this.room + ' (' + this.members + ' members)');
    }

    memberLeft() {
        this.members--;
        console.log( 'Someone left ' + this.room + '(' + this.members + ' members)');
    }

    openVotationHandler( job, done ) {
        const votation = job.data.votation;

        /*if( this.activeCodes[ votation.code ] ) {
            console.log( 'attempted to open a votation of a non resolved code. Waiting...' );
            setTimeout( () => this.openVotationHandler( job, done ), this.duplicateCodeWaitTime );
            return;
        }*/

        console.log( 'opening votation ('  + this.room + '): ' + this.getVotationId( job.data.votation ) );
        //Initialize the votation data
        //============================
        this.voteCount[ this.getVotationId( votation ) ] = 0;
        this.activeCodes[ votation.code ] = true;
        //First veredict is: not_valid - code not exists.
        if( votation.codeSearch ) {
            this.veredicts[ this.getVotationId( votation ) ] = {
                consensus: {
                    code: votation.code
                },
                verification: 'not_valid',
                message: 'El código no existe...'
            };
        } else {
            this.veredicts[ this.getVotationId( votation ) ] = {
                consensus: {
                    code: votation.code
                },
                verification: 'not_valid',
                message: 'La votación falló. Vuelva a escanear.'
            };
        }
        

        //Set votation ender
        this.votationEnders[ this.getVotationId( job.data.votation ) ] = done;
        
        //Creates the votation killer
        const killerJob = this.votationKillersQueue.create( 
            'kill_votation_' + this.room, 
            { votation: job.data.votation}
        )
        .removeOnComplete( true )
        .delay( this.votationTTL )
        .save( error => {
            console.log( 'saving killer with TTL ' + this.votationTTL );
            if( !error ) {
                this.votationKillers[ this.getVotationId( job.data.votation ) ] = killerJob;
                //notify all members
                this.broadcastVotationHandler( this.room, job.data.votation );
                console.log( 'votation opened' );
                console.log( new Date().getTime() + ' ' + new Date() );
            }
        });
    }

    /*
        Returns an identifier of a votation object, based on:
            -Code scanned
            -When the votation started
    */
    getVotationId( votation ) {
        return votation.code+votation.openedBy+new Date(votation.openedAt).getTime();
    }

    /*
        Push the vote into the votingQueue.

        @vote: the last received vote
    */
    voteReceived( vote ) {
        console.log( 'vote received ' + this.room );
        console.log( new Date().getTime() + ' ' + new Date() );
        
        //Avoid cycles in vote object
        const voteThrough = {...vote};
        delete voteThrough.votation; 
        //Pass the vote and votation to the vote job.
        this.votesQueue.create( 'vote_' + this.room, { vote: voteThrough, votation: vote.votation } ).removeOnComplete(true).save( error => {
            if( !error ) {
                console.log( 'vote enqueued' );
            }
        });
    }

    /*
        Updates the votation veredict and close the votation.

        @vote: the vote to process.        
        @votation: the votation where the vote is account.  
    */
    processVote( vote, votation ) {
        console.log( 'processing vote' );       
        console.log( vote );
        console.time('vote_processing');
        //Votation ended        
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            console.log( 'attempted to process a vote of an ended votation...' );
            return;
        }

        //Update vote count
        const votes = ++this.voteCount[ this.getVotationId( votation ) ];
        //Updates the veredict
        this.veredicts[ this.getVotationId( votation ) ] = {
            consensus: vote.veredict.proposal, 
            verification: vote.veredict.verification,
            message: vote.veredict.message
        };

        //CONSENSUS not possible, all voted or codeSearch (code was found, search can be stopped).
        if( vote.veredict.verification === 'not_valid' || votes === this.members || votation.codeSearch ) {
            this.closeVotation( votation );
        }
        console.timeEnd('vote_processing');
    }

    //Register the votation and start the voting process
    openVotation( votation ) {
        //Pass the votation and the room name to the job.
        this.votationsToOpenQueue.create( 'open_votation_' + this.room, { votation, room: this.room } ).removeOnComplete(true).save( 
            error => {
                if( !error ) {                
                    console.log( 'votation broadcast enqueued' );
                    console.log( votation );
                }
            }
        )
    }

    /*
        Ends a votation.

        @votation: the votation to close.
    */
    closeVotation( votation ) {
        console.log( 'votation ended (' + this.room + '): ' + this.getVotationId( votation ) );

        //Already closed
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            console.log( 'attempted to end and ended votation' );
            if( this.activeCodes[ votation.code ] ) {
                delete this.activeCodes[ votation.code ];
            }
            return;
        }

        const voteCount = this.voteCount[ this.getVotationId( votation ) ] || 0;
        const veredict = this.veredicts[ this.getVotationId( votation ) ];
        //ms between when votation opened and closing.
        const elapsed = Math.abs( (new Date()).getTime() - (new Date(votation.openedAt)).getTime() );

        //If valid, updates the DB
        if( veredict.verification === 'valid' ) {
            CodeController.update( veredict.consensus.id, veredict.consensus );
        }

        //Notify the room members
        this.closeVotationHandler( this.room, {
            ...veredict,
            offline: votation.offline,
            codeSearch: votation.codeSearch,
            openedBy: votation.openedBy,
            closed_at: new Date(),
            elapsed,
            votes: voteCount
        }, votation.openerId);        

        //Remove the stored votation data
        delete this.voteCount[ this.getVotationId( votation ) ];
        delete this.veredicts[ this.getVotationId( votation ) ];
        delete this.activeCodes[ votation.code ];

        //Ends the votation
        this.votationEnders[ this.getVotationId( votation ) ]();
        delete this.votationEnders[ this.getVotationId( votation ) ];

        console.timeEnd('votation_duration');
    }
}

module.exports = VotingRoom;