const Model = require( './Model' );
const User = require( './User' );

class LogEntry extends Model {
    static get tableName() {
        return 'LogEntries';
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'LogEntries.user_id',
                    to: 'Users.id'
                }
            }
        }
    };
}

module.exports = LogEntry;