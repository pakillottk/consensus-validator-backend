const Model = require( './Model' );
const User = require('./User');

class SessionSupervisor extends Model {
    static get tableName() {
        return 'SessionSupervisors';
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'SessionSupervisors.user_id',
                    to: 'Users.id'
                }
            }
        }
    };

    static get columns() {
        return [ 
            'id',
            'session_id',
            'user_id',
            'created_at', 
            'updated_at' 
        ];
    }
}

module.exports = SessionSupervisor;