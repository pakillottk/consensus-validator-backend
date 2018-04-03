const ModelController = require('./ModelController').class
const Type = require( '../Database/Type' )

class CodeController extends ModelController {
    async create( data, including, query ) {
        let trx;
        const sessionId = query.session;
        try {
            trx = await transaction.start( this.model.knex() );

            const typeAssigned = await Type.query().where( 'type', '=', data.type ).andWhere( 'session_id', '=', sessionId );
            let type;
            if( typeAssigned.length === 0 ) {
                //CREATE THE TYPE
                type = await Type.query( trx ).insert({
                    type: data.type, 
                    price: 0, 
                    ammount: 0, 
                    session_id: sessionId,
                    created_at: new Date(),
                    updated_at: new Date()
                })
            } else {
                type = typeAssigned[ 0 ]
            }

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
                type_id: type.id, 
                created_at: new Date(),
                updated_at: new Date()
            });            

            await trx.commit();

            return code;
        } catch( error ) {
            await trx.rollback();
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = ( model ) => new CodeController( model );