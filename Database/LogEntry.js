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

    static get columns() {
        return [
            'id',
            'user_id',
            'level',
            'msg',
            'date',
            'session_id',
            'created_at',
            'updated_at'
        ];
    }

    async $afterInsert( context ) {
        await super.$afterInsert( context );
        
        const sessionId = this.session_id;

        const ioController = Model.io;
        ioController.emitTo( sessionId + '-session', 'log_entry_added' ,this );
    }
}

module.exports = LogEntry;