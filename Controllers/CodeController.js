const ModelController = require('./ModelController').class
const Type = require( '../Database/Type' )

class CodeController extends ModelController {
    async create( data, including, query ) {
        const sessionId = query.session;
        try {
            const typeAssigned = await Type.query().where( 'type', '=', data.type ).andWhere( 'session_id', '=', sessionId );
            let type;
            if( typeAssigned.length === 0 ) {
                //CREATE THE TYPE
                type = await Type.query().insert({
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

            const code = await this.model.query().eager( including ).insert({
                ...data, 
                type_id: type.id, 
                created_at: new Date(),
                updated_at: new Date()
            });            
            return code;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = ( model ) => new CodeController( model );