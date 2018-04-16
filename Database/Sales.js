const Model = require( './Model' );
const User = require( './User' );
const Code = require( './Code' );
const Type = require('./Type');

class Sales extends Model {
    static get tableName() {
        return 'Sales';
    }
    
    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'Sales.user_id',
                    to: 'Users.id'
                }
            },
            code: {
                relation: Model.BelongsToOneRelation,
                modelClass: Code,
                join: {
                    from: 'Sales.code_id',
                    to: 'Codes.id'
                }
            }
        };
    }

    async $afterInsert( context ) {
        await super.$afterInsert( context );
        setTimeout( async () => {
            const sale = await Sales.query().eager( '[code.[type]]' ).where( 'id', '=', this.id );
            const sessionId = sale[0].code.type.session_id;

            const ioController = Code.io;
            ioController.emitTo( sessionId + '-session', 'sale_added' ,this );
        }, 1000 );
        
        /*
        
        */
    }
}

module.exports = Sales;