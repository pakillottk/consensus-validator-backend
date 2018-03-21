const Model = require( './Model' );
const Session = require( './Session' );
const ScanType = require('./ScanType');

class ScanGroup extends Model {
    static get tableName() {
        return 'ScanGroups';
    }

    static get relationMappings() {
        return {
            session: {
                relation: Model.BelongsToOneRelation,
                modelClass: Session,
                join: {
                    from:'ScanGroups.session_id',
                    to: 'Sessions.id'
                }
            },
            valid_types: {
                relation: Model.HasManyRelation,
                modelClass: ScanType,
                join: {
                    from:'ScanGroups.id',
                    to: 'ScanTypes.group_id'
                }
            },
        };
    }
}

module.exports = ScanGroup;