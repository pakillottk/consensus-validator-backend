const ModelController = require('./ModelController').class
const kue = require( 'kue' );

class SeatReserveController extends ModelController {
    constructor( model ) {
        super( model );

        this.jobsResponses = {}
        this.queue = kue.createQueue();
        this.queue.process( 'reserve_seat', ( job, done ) => {
            this.createReserve(
                job.id,
                job.data.data,
                job.data.including,
                job.data.query,
                done
            );
        });
    }

    async create( data, including, query, res ) {
        const jobData = {
            data,
            including,
            query
        };
        const job = this.queue.create( 'reserve_seat', jobData )
            .removeOnComplete( true )
            .save(
                ( error ) => {
                    if( !error ) {
                        this.jobsResponses[ job.id ] = res;
                        return;
                    } 
                    res.status( 400 ).send( error );
                }
            );
    }

    async createReserve( id, data, including, query, done ) {
        const res = this.jobsResponses[ id ];
        if( !res ) {
            throw new Error( "There's no response object for this job: " + id );
        }
        //ensure that seat is not already reserved
        const reserves = await this.model.query()
                            .where( 'session_id', '=',  data.session_id )
                            .andWhere( 'zone_id', '=', data.zone_id )
                            .andWhere( 'seat_row', '=', data.seat_row )
                            .andWhere( 'seat_index', '=', data.seat_index );
        const now = new Date();
        const validReserve = reserves.some( 
            reserve => {
                return reserve.expires_at === null || reserve.expires_at > now;
            }
        );

        if( !validReserve ) {
            try {
                const created = await this.model.query().eager( including ).insert( {...data, created_at: new Date(), updated_at: new Date()} );
                res.status(200).send(created);
                done();
            } catch( error ) {
                res.status(400).send( { code: error.code, message: error.detail } );
                done( new Error( error ) );
            }
        } else {
            res.status( 400 ).send( {error:{message:'Seat already reserved...'}} );
            done( new Error( 'Seat already reserved...' ) );
        }

        delete this.jobsResponses[ id ];
    }
}

module.exports = ( model ) => new SeatReserveController( model );