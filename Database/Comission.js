const Model = require( './Model' );
const User = require( './User' );
const Session = require( './Session' );

class Comission extends Model {
    static get tableName() {
        return 'Comissions';
    }
    
    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'Comissions.user_id',
                    to: 'Users.id'
                }
            },
            session: {
                relation: Model.BelongsToOneRelation,
                modelClass: Session,
                join: {
                    from: 'Comissions.session_id',
                    to: 'Sessions.id'
                }
            }
        };
    }

    static get columns() {
        return [
            'id',
            'session_id',
            'user_id',
            'distribution_cost',
            'comission',
            'apply_on',
            'created_at',
            'update_at'
        ];
    }
}

module.exports = Comission;