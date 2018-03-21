const ModelController = require('./ModelController').class
const Deliver = require( '../Database/Deliver' );
const Type = require( '../Database/Type' );
const Code = require( '../Database/Code' );
const kue = require( 'kue' );
const crypto = require( 'crypto' );
const { transaction } = require( 'objection' );

class SaleController extends ModelController {
    constructor( model ) {
        super( model );

        this.jobsResponses = {};
        this.queue = kue.createQueue();
        this.queue.process( 'sale', ( job, done ) => {
            this.createSale( job.id, job.data.data, job.data.including, job.data.query, done );
        });
    }

    async getAuthSales( type_id, user_id ) {
        let authSales       = await Deliver.query().sum('ammount')
                            .where( 'type_id', '=', type_id )
                            .andWhere( 'user_id', '=', user_id );
        if( authSales.length === 0 ) {
            return 0;
        }
        authSales = authSales[0].sum;

        return authSales
    } 

    async getCodeIds( type_id ) {
        const codesOfType = await Code.query().where( 'type_id', '=', type_id );
        const codesIds = []
        codesOfType.forEach( code => {
            codesIds.push( code.id );
        });

        return codesIds;
    }

    async getSoldTickets( codeIds, user_id ) {
        let soldByMe = await this.model.query().count()
                                .where( 'code_id', 'in', codeIds )
                                .andWhere( 'user_id', '=', user_id );
        soldByMe = soldByMe[0].count;

        return soldByMe;
    }

    async createSale( id, data, including, query, done ) {
        const res = this.jobsResponses[ id ];
        if( !res ) {
            throw new Error( "There's no response object for this job: " + job );
        }

        let trx;
        try {
            //Get tickets delivered to user
            const authSales = await this.getAuthSales( data.type_id, data.user_id );
            if( authSales === 0 ) {
                res.status( 401 ).send({error:{message: "User is not allowed to sell this type"}});
            }
            //Get existing codes of type_id
            const codesIds = await this.getCodeIds( data.type_id );
            //Get current sold codes
            const soldByMe = await this.getSoldTickets( codesIds, data.user_id );
            
            //If still under 
            if( parseInt(soldByMe) < parseInt(authSales) ) {
                trx = await transaction.start( this.model.knex() );

                const hashData = data.user_id + "" + data.type_id + "" + new Date().toString() + "" + new Date().getTime(); 
                const hashCode = crypto.createHash('md5').update(hashData).digest("hex");
                const newCode = await Code.query( trx ).insert({
                    code: 'CNS' + hashCode.substr(0, 9),
                    name: data.name,
                    type_id: data.type_id,
                    email: data.email,
                    validations: 0,
                    maxValidations: 1,
                    out: true,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                const sale = await this.model.query( trx ).eager( including ).insert({
                    user_id: data.user_id,
                    code_id: newCode.id,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                await trx.commit();

                res.send( sale );
                done();
            } else {
                if( trx ) {
                    await trx.rollback();
                }
                res.status( 400 ).send({error:{message: "All sold"}});
                done( new Error( "All sold!" ) );
            }  
        } catch( error ) {
            res.status( 400 ).send( error );
            done( new Error( error ) );
        }

        delete this.jobsResponses[ id ];
    }

    async create( data, including, query, res ) {
        const jobData =  { data, including: including, query: query };
        const job = this.queue.create( 'sale', jobData ).save(
            ( error ) => {  
                if( !error ){
                    this.jobsResponses[ job.id ] = res;
                    return;
                } 

                res.status( 400 ).send( error );
            }
        );
    }

    async delete( id ) {
        let trx;
        try {
            trx = await transaction.start( this.model.knex() );

            const toDelete = await this.model.query().findById( id );
            const codeId = toDelete.code_id
            //Delete the sale
            const deleted = await this.model.query( trx ).deleteById( id );
            //Delete the code
            await Code.query( trx ).deleteById( codeId )

            await trx.commit();

            return { deleted_at: new Date(), deleted_id: id };
        } catch( error ) {
            await trx.rollback();

            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = ( model ) => new SaleController( model );