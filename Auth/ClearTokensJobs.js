const kue = require( 'kue' );
const clearOutdatedTokens = require('./OAuthModel').clearOutdatedTokens;

class ClearTokensJobs {
    constructor( interval ) {
        this.queue = kue.createQueue()
        //Default: 1 hour interval
        this.interval = interval || ( 60 * 60 * 1000 ) 

        this.queue.process( 'clear_tokens_job', (job, done) => {
            this.clearTokens( done );
        });

        this.startJob();
    }

    startJob() {
        this.queue.create( 'clear_tokens_job', {} ).save(
            (error) => {
                if( error ) {
                    console.log( error );
                }
            }
        );
        setTimeout(() => this.startJob(), this.interval);
    }

    async clearTokens( done ) {
        try {
            const result = await clearOutdatedTokens();
            console.log( 'Cleared: ' + result + ' tokens at: ' + new Date() );
            done();
        } catch( error ) {
            done( new Error( error ) );
        }
    }
}

module.exports = (interval) => new ClearTokensJobs( interval );