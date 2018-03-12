const Model = require( './Model' );
const User = require( './User' );
const Type = require( './Type' );

class Deliver extends Model {
    static get tableName() {
        return 'Delivers';
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'Delivers.user_id',
                    to: 'Users.id'
                }
            },
            type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Type,
                join: {
                    from: 'Delivers.type_id',
                    to: 'Types.id'
                }
            }
        };
    }
}

module.exports = Deliver;