const Model = require( './Model' );
const ScanGroup = require( './ScanGroup' );
const Type = require( './Type' );

class ScanType extends Model {
    static get tableName() {
        return 'ScanTypes';
    }
    
    static get relationMappings() {
        return {
            group: {
                relation: Model.BelongsToOneRelation,
                modelClass: ScanGroup,
                join: {
                    from: 'ScanTypes.group_id',
                    to: 'ScanGroups.id'
                }
            },
            type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Type,
                join: {
                    from: 'ScanTypes.type_id',
                    to: 'Types.id'
                }
            }
        };
    }
}

module.exports = ScanType;