const Model = require( './Model' );
const Type = require( './Type' );

class Code extends Model {
    static get tableName() {
        return 'Codes';
    }

    static get relationMappings() {
        return {
            type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Type,
                join: {
                    from:'Codes.type_id',
                    to: 'Types.id'
                }
            },
        }
    };

    async $afterInsert( context ) {
        await super.$afterInsert( context );

        const ioController = Code.io;
        let sessionId;
        const type = await Type.query().select( 'session_id' ).where( 'id', '=', this.type_id );
        if( type.length > 0 ) {
            sessionId = type[0].session_id;
        }
        if( sessionId ) {
            ioController.emitTo( sessionId + '-session', 'code_added' ,this );        
        }
    }

    async $afterUpdate( context ) {
        await super.$afterUpdate( context );
        
        const type = await Type.query().select( 'session_id' ).where( 'id', '=', this.type_id );
        const sessionId = type[0].session_id;

        const ioController = Code.io;
        ioController.emitTo( sessionId + '-session', 'code_updated' ,this );
    }
}

module.exports = Code;