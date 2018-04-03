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
        
        //Time to wait until force the votation ending (avoid high latency and deal with absent votations)
        this.votationTTL = 1000;
        //Time to wait for all nodes to receive the votation
        this.propagationTime = 0;

        this.votingQueue = kue.createQueue();
        //OPEN A VOTATION
        this.votingQueue.process( 'open_votation', ( job, done ) => {
            //notify all members
            this.broadcastVotationHandler( job.data.room, job.data.votation );
            //when propagationTime passes
            setTimeout( () => {
                //set the TTL timeout
                this.timeouts[ 
                    this.getVotationId(job.data.votation) 
                ] = setTimeout( 
                        () => {
                            console.log( 'votation timed out' );
                            this.closeVotation( job.data.votation );
                        }, 
                        this.votationTTL 
                    );

                done();
            }, this.propagationTime );
        });

        //PROCESS A VOTE
        this.votingQueue.process( 'vote', ( job, done ) => {
            this.processVote( job.data.vote, job.data.votation );
            done();
        });
    }

    memberJoined() {
        this.members++;
    }

    memberLeft() {
        this.members--;
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
        console.log( 'vote received' );
        //console.log( vote.veredict );
        
        //When no veredict defined, the votation is closed. (closeVotation deleted it)
        if( this.veredicts[ this.getVotationId( vote.votation ) ] === undefined ) {
            console.log( 'received a vote of an ended votation...' );
        } else {
            //Avoid cycles in vote object
            const voteThrough = {...vote};
            delete voteThrough.votation; 
            //Pass the vote and votation to the vote job.
            this.votingQueue.create( 'vote', { vote: voteThrough, votation: vote.votation } ).save( error => {
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
        //Votation ended
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            return;
        }

        //Update vote count
        const votes = ++this.voteCount[ this.getVotationId( votation ) ];
        //Get current veredict of the votation
        const currentVeredict = this.veredicts[ this.getVotationId( votation ) ];

        //First vote
        if( currentVeredict.consensus.id === undefined ) {
            this.veredicts[ this.getVotationId( votation ) ] = {
                consensus: vote.veredict.proposal, 
                verification: vote.veredict.verification,
                message: vote.veredict.message
            };
            //CONSENSUS not possible or all voted.
            if( vote.veredict.verification === 'not_valid' || votes === this.members ) {
                this.closeVotation( votation );
            }
        } else {
            //No CONSENSUS. Not valid
            if( currentVeredict.verification === 'not_valid' ) {
                currentVeredict.message = vote.veredict.message;
                this.veredicts[ this.getVotationId( votation ) ] = currentVeredict;
                this.closeVotation( votation );
            }
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
        setTimeout( () => this.votingQueue.create( 'open_votation', { votation, room: this.room } ).save( error => {
            if( !error ) {                
                console.log( 'votation broadcast enqueued' );
            }
        }), 50);
    }

    /*
        Ends a votation.

        @votation: the votation to close.
    */
    closeVotation( votation ) {
        //Already closed
        if( !this.veredicts[ this.getVotationId( votation ) ] ) {
            return;
        }
        //Clear the TTL timeout and delete it from the timeouts registry.
        clearTimeout( this.timeouts[ this.getVotationId( votation ) ] );
        delete this.timeouts[ this.getVotationId( votation ) ];

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