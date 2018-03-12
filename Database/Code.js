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
}

module.exports = Code;