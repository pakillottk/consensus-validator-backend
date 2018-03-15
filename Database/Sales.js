const Model = require( './Model' );
const User = require( './User' );
const Code = require( './Code' );

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
                    to: 'User.id'
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
}

module.exports = Sales;