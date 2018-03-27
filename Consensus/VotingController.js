const kue = require('kue');
const CodeModel = require('../Database/Code');
const CodeController = require('../Controllers/CodeController')(CodeModel);

class VotingController {
    constructor( broadcastVotation, closeVotationHandler, waitTime ) {
        this.broadcastVotation = broadcastVotation;
        this.closeVotationHandler = closeVotationHandler;
        this.waitTime = waitTime || 500;
        this.socketsRooms = {};

        this.votes = {};
        this.veredicts = {};

        this.votingQueue = kue.createQueue();
        this.votingQueue.process( 'open_votation', ( job, done ) => {
            this.broadcastVotation( job.data.room, job.data.votation );
            done();
        });
        this.votingQueue.process( 'votation', ( job, done ) => {
            this.runVotation( true, job.data, done );
        });
    }

    registerSocket( room, socketId ) {
        this.socketsRooms[ socketId ] = room;
        console.log( this.socketsRooms );
    }

    removeSocket( socketId ) {
        delete this.socketsRooms[ socketId ];
        console.log( this.socketsRooms );
    }

    getVotationId( votation ) {
        return votation.code+votation.openedBy+new Date(votation.openedAt).getTime();
    }

    openVotation( votation, broadcastVotation ) {
        //Register the votation and start the voting process
        this.votingQueue.create( 'open_votation', { votation, room: this.socketsRooms[ votation.openedBy ] } ).save( error => {
            if( !error ) {
                console.log( 'votation broadcast enqueued' );
            }
        });
    
        this.votingQueue.create( 'votation', votation ).save( ( error ) => {
            if( !error ) {
                console.log( 'votation created' );                
            }
        });
    }

    voteReceived( vote ) {
        console.log( 'vote received' );
        console.log( vote.veredict );
        if( !this.votes[ this.getVotationId( vote.votation ) ] ) {
            this.votes[ this.getVotationId( vote.votation ) ] = [ vote ];
        } else {
            this.votes[ this.getVotationId( vote.votation ) ].push( vote );
        }
    }

    closeVotation( votation ) {
        const veredict = this.veredicts[ this.getVotationId( votation ) ];
        console.log( 'votation ended' );
        console.log( veredict );
        //If valid, updates the DB
        if( veredict.verification === 'valid' ) {
            CodeController.update( veredict.consensus.id, veredict.consensus );
        }
        this.closeVotationHandler( this.socketsRooms[ votation.openedBy ], {
            ...veredict,
            closed_at: new Date()
        });

        delete this.votes[ this.getVotationId( votation ) ];
        delete this.veredicts[ this.getVotationId( votation ) ];
    }

    runVotation( firstRun, votation, done ) {
        const votes = this.votes[ this.getVotationId( votation ) ];
        
        if( firstRun && !votes ) {
            setTimeout( () => this.runVotation( false, votation, done ), this.waitTime );
            return;
        }

        //All absent. Not valid.
        if( !firstRun && !votes) {
            this.veredicts[ this.getVotationId( votation ) ] = {
                consensus: null,
                verification: 'not_valid'
            };
            this.closeVotation( votation );
            done();
            return;
        }

        //End of votation
        if( !firstRun && votes.length === 0 ) {
            this.closeVotation( votation );
            done();
            return;
        }

        while( votes.length > 0 ) {
            const vote = votes.shift();
            const currentVeredict = this.veredicts[ this.getVotationId( votation ) ];

            //First vote
            if( !currentVeredict ) {
                const veredict =  {
                    consensus: vote.veredict.proposal, 
                    verification: vote.veredict.verification,
                    message: vote.veredict.message
                };
                this.veredicts[ this.getVotationId( votation ) ] = veredict;
            } else {
                //No CONSENSUS. Not valid
                if( currentVeredict.verification === 'not_valid' ) {
                    currentVeredict.message = vote.message;
                    this.closeVotation( votation );
                    done();
                    return;
                }
            }
        }

        setTimeout( () => this.runVotation( false, votation, done ), this.waitTime );
    }
}

module.exports = ( broadcastVotation, closeVotationHandler, waitTime) => new VotingController( broadcastVotation, closeVotationHandler, waitTime );