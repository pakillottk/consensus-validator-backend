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
        //TTL exceeded votation killers
        this.timeouts = {};
        
        this.voteCount = {};
        this.veredicts = {};
        
        //Time to wait until force the votation ending, when votes stop coming
        //(avoid high latency and deal with absent votations)
        this.votationTTL = 1000;

        this.votingQueue = kue.createQueue();
        //OPEN A VOTATION
        this.votingQueue.process( 'open_votation', ( job, done ) => {
            //notify all members
            this.broadcastVotationHandler( job.data.room, job.data.votation );
            this.resetVotationTimeout( job.data.votation );
            done();
        });

        //PROCESS A VOTE
        this.votingQueue.process( 'vote', ( job, done ) => {
            this.processVote( job.data.vote, job.data.votation );
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

    clearVotationTimeout( votation ) {
        console.log( 'clearing timeout for votation: ' + this.getVotationId( votation ) );

        clearTimeout( this.timeouts[ this.getVotationId( votation ) ] );
        delete this.timeouts[ this.getVotationId( votation ) ];
    }

    resetVotationTimeout( votation ) {
        const setTime = new Date();
        console.log( this.getVotationId( votation ) + ' TTL set at: ' + setTime.getTime() + ' ' + setTime );
        //set the TTL timeout
        this.timeouts[ 
            this.getVotationId(votation) 
        ] = setTimeout( 
                () => {
                    const timeoutAt = new Date();
                    const TTLtime = Math.abs( setTime.getTime() - timeoutAt.getTime() );
                    console.log( 'votation timed out' );
                    console.log( 'TTL: ' + TTLtime );
                    console.log( 'at: ' + timeoutAt.getTime() + ' ' + timeoutAt );
                    this.closeVotation( votation );
                }, 
                this.votationTTL 
            );
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
            this.clearVotationTimeout( vote.votation );
            this.resetVotationTimeout( vote.votation );

            //Pass the vote and votation to the vote job.
            this.votingQueue.create( 'vote', { vote: voteThrough, votation: vote.votation } ).removeOnComplete(true).save( error => {
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
        this.votingQueue.create( 'open_votation', { votation, room: this.room } ).removeOnComplete(true).save( 
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
        console.log( 'votation ended' );

        //Already closed
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            return;
        }
        //Clear the TTL timeout and delete it from the timeouts registry.
        this.clearVotationTimeout( votation );

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
    }
}

module.exports = VotingRoom;