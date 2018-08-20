const ModelController = require('./ModelController').class
const Code = require('../Database/Code')
const Type = require( '../Database/Type' )
const { transaction } = require( 'objection' )

class CodeController extends ModelController {
    constructor( model ) {
        super( model );

        this.createdTypes = {};
    }

    //Generates ammount orphan codes of typeId.
    async generateCodes( ammount, typeId, sessionId, including ) {
        let trx
        try {
            trx = await transaction.start( this.model.knex() )
            const codes = []
            for(let i=0;i<ammount;i++) {
                const code = await this.createCode(
                    {
                        code: Code.generateCode( Math.round(Math.random()*1432), typeId ), 
                        type_id: typeId
                    },
                    including, 
                    { session:sessionId }, 
                    trx 
                )
                codes.push(code)
            }
            await trx.commit()

            return codes
        } catch( e ) {
            if( trx ) {
                await trx.rollback()
            }
            throw e
        }
    }

    async findOrCreateCodeType( typeLabel, sessionId, trx ) {
        const typeAssigned = await Type.query().where( 'type', '=', typeLabel ).andWhere( 'session_id', '=', sessionId );
        let type = this.createdTypes[ data.type ]; //cached?
        if( !type ) { //Not cached
            if( typeAssigned.length === 0 ) {                
                //CREATE THE TYPE
                type = await Type.query( trx ).insert({
                    type: type, 
                    price: 0, 
                    ammount: 0, 
                    session_id: sessionId,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                this.createdTypes[ data.type ] = type;
            } else {
                type = typeAssigned[ 0 ]
            }
        }

        return type
    }

    async createCode( data, including, query, trx ) {   
        const sessionId = query.session;
        try {
            if( data.validations === undefined || data.validations === null || data.validations === "") {
                data.validations = 0
            }
            if( data.maxValidations === undefined || data.maxValidations === null || data.maxValidations === "") {
                data.maxValidations = 1
            }
            if( data.out === undefined || data.out === null || data.out.trim() === "") {
                data.out = true
            }

            const code = await this.model.query( trx ).eager( including ).insert({
                ...data, 
                type_id: data.type_id?data.type_id:await this.findOrCreateCodeType(data.type, sessionId, trx).id, 
                created_at: new Date(),
                updated_at: new Date()
            });            

            return code;
        } catch( error ) {
            throw error;
        }
    }

    async create( data, including, query ) {   
        let trx; let response;         
        if( data.codes ) {
            try {
                const codes = JSON.parse( data.codes );
                trx = await transaction.start( this.model.knex() );
                const output = [];
                for( let i = 0; i < codes.length; i++ ) {
                    const code = await this.createCode( codes[i], including, query, trx );
                    output.push( code );
                }  

                await trx.commit();
            
                response = {array: JSON.stringify(output) };
            } catch( error ) {
                await trx.rollback();
                this.createdTypes = {};
                throw { code: error.code, message: error.detail };
            }
        } else {
            try {
                trx = await transaction.start( this.model.knex() );
                const code = await this.createCode( data, including, query, trx );
                await trx.commit();

                response = code;
            } catch( error ) {
                await trx.rollback();
                this.createdTypes = {};
                throw { code: error.code, message: error.detail };
            }
        }   
        
        this.createdTypes = {};
        return response;
    }
}

module.exports = ( model ) => new CodeController( model );