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
        
        //Time to wait until force the votation ending, when votes stop coming
        //(avoid high latency and deal with absent votations)
        this.votationTTL = 500;
        //Stores the ID of the job responsible for killing a votation
        this.votationKillers = {};
        //Stores the done callback of the open_votation kue job.
        this.votationEnders = {};

        //Queues to avoid race conditions and make background jobs
        //========================================================
        this.votationsToOpenQueue = kue.createQueue();
        this.votesQueue = kue.createQueue();
        //Forces the end of a votation (if votes stop coming or all nodes absent)
        this.votationKillersQueue = kue.createQueue(); 

        //OPEN A VOTATION
        this.votationsToOpenQueue.process( 'open_votation', ( job, done ) => {
            //notify all members
            this.broadcastVotationHandler( job.data.room, job.data.votation );
            //Set votation ender
            this.votationEnders[ this.getVotationId( job.data.votation ) ] = done;
            //Creates the votation killer
            const killerJob = this.votationKillersQueue.create( 
                'kill_votation', 
                { votation: job.data.votation}
            )
            .removeOnComplete( true )
            .delay( this.votationTTL )
            .save( error => {
                if( !error ) {
                    this.votationKillers[ this.getVotationId( job.data.votation ) ] = killerJob.id;
                }
            });
        });

        //PROCESS A VOTE
        this.votesQueue.process( 'vote', ( job, done ) => {
            this.processVote( job.data.vote, job.data.votation );
            done();
        });

        //KILLS A VOTATION
        this.votationKillersQueue.process( 'kill_votation', ( job, done ) =>  {
            //If votation didn't already ended
            if( this.veredicts[ this.getVotationId( job.data.votation ) ] ) {
                this.closeVotation( job.data.votation );
            }

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

    /*
        Returns an identifier of a votation object, based on:
            -Code scanned
            -Id of the node who openend the votation
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
        //console.log( vote.veredict );
        
        //When no veredict defined, the votation is closed. (closeVotation deleted it)
        if( this.veredicts[ this.getVotationId( vote.votation ) ] === undefined ) {
            console.log( 'received a vote of an ended votation...' );
        } else {
            //Avoid cycles in vote object
            const voteThrough = {...vote};
            delete voteThrough.votation; 

            //Avoid timeout kill before processing the vote.
            //(?)

            //Pass the vote and votation to the vote job.
            this.votesQueue.create( 'vote', { vote: voteThrough, votation: vote.votation } ).removeOnComplete(true).save( error => {
                if( !error ) {
                    console.log( 'vote enqueued' );
                }
            });        
        }
    }

    /*
        Updates the votation veredict and close the votation.

        @vote: the vote to process.        
        @votation: the votation where the vote is account.  
    */
    processVote( vote, votation ) {
        const now = new Date();
        const openedAt = new Date(votation.openedAt);

        console.log( 'processing vote' );       
        console.log( 'time to process this vote: ' + Math.abs( now.getTime() - openedAt.getTime() ) );

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

        //CONSENSUS not possible or all voted.
        if( vote.veredict.verification === 'not_valid' || votes === this.members ) {
            this.closeVotation( votation );
        }
    }

    //Register the votation and start the voting process
    openVotation( votation ) {
        this.voteCount[ this.getVotationId( votation ) ] = 0;
        //First veredict is: not_valid - code not exists.
        this.veredicts[ this.getVotationId( votation ) ] = {
            consensus: {
                code: votation.code
            },
            verification: 'not_valid',
            message: 'El código no existe...'
        };

        //Pass the votation and the room name to the job.
        this.votationsToOpenQueue.create( 'open_votation', { votation, room: this.room } ).removeOnComplete(true).save( 
            error => {
                if( !error ) {                
                    console.log( 'votation broadcast enqueued' );
                }
            }
        )
    }

    /*
        Ends a votation.

        @votation: the votation to close.
    */
    closeVotation( votation ) {
        console.log( 'votation ended: ' + this.getVotationId( votation ) );

        //Already closed
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            console.log( 'attempted to end and ended votation' );
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
            openedBy: votation.openedBy,
            closed_at: new Date(),
            elapsed,
            votes: voteCount
        });        

        //Remove the stored votation data
        delete this.voteCount[ this.getVotationId( votation ) ];
        delete this.veredicts[ this.getVotationId( votation ) ];
        delete this.votationKillers[ this.getVotationId( votation ) ];

        //Ends the votation
        this.votationEnders[ this.getVotationId( votation ) ]();
        delete this.votationEnders[ this.getVotationId( votation ) ];
    }
}

module.exports = VotingRoom;