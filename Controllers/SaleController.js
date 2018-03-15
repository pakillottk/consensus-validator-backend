const ModelController = require('./ModelController').class
const Deliver = require( '../Database/Deliver' );
const Type = require( '../Database/Type' );
const Code = require( '../Database/Code' );
const kue = require( 'kue' );
const crypto = require( 'crypto' );

class SaleController extends ModelController {
    constructor( model ) {
        super( model );

        this.queue = kue.createQueue();
        this.queue.process( 'sale', ( job, done ) => {
            this.createSale( job.data, job.including, job.query, res, done );
        });
    }

    async getAuthSales( type_id, user_id ) {
        let authSales       = await Deliver.query().sum('ammount')
                            .where( 'type_id', '=', data.type_id )
                            .andWhere( 'user_id', '=', data.user_id );
        if( authSales.length === 0 ) {
            return 0;
        }
        authSales = authSales[0].sum;

        return authSales
    } 

    async getCodeIds( type_id ) {
        const codesOfType = await Code.query().where( 'type_id', '=', data.type_id );
        const codesIds = []
        codesOfType.forEach( code => {
            codesIds.push( code.id );
        });

        return codesIds;
    }

    async getSoldTickets( codeIds, user_id ) {
        let soldByMe = await this.model.query().count()
                                .where( 'code_id', 'in', codesIds )
                                .andWhere( 'user_id', '=', data.user_id );
        soldByMe = soldByMe[0].count;

        return soldByMe;
    }

    async createSale( data, including, query, res, done ) {
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
            if( soldByMe < authSales ) {
                const hashData = data.user_id + "" + data.user_id + "" + new Date().toString(); 
                const hashCode = crypto.createHash('md5').update(hashData).digest("hex");
                const newCode = await Code.query().insert({
                    code: hashCode,
                    name: data.name,
                    type_id: data.type_id,
                    email: data.email,
                    validations: 0,
                    maxValidations: 1,
                    out: true,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                const sale = await this.model.query().eager( including ).insert({
                    user_id: data.user_id,
                    code_id: newCode.id,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                res.send( sale );
                done();
            } else {
                res.status( 400 ).send({error:{message: "All sold"}});
                done( new Error( "All sold!" ) );
            }  
        } catch( error ) {
            res.status( 400 ).send( error );
            done( new Error( error ) );
        }  
    }

    async create( data, including, query, res ) {
        this.queue.create( 'sale', {data, including, query, res}).save(
            ( error ) => {  
                if( !error ){
                    return;
                } 

                throw { code: error.code, message: error.detail };
            }
        );
    }
}

module.exports = ( model ) => new SaleController( model );