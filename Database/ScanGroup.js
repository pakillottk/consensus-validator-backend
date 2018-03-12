const Model = require( './Model' );
const Session = require( './Session' );

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
        };
    }
}

module.exports = ScanGroup;