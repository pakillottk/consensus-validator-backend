const Model = require( './Model' );
const User = require( './User' );
const Session = require( './Session' );

class Payment extends Model {
    static get tableName() {
        return 'Payments';
    }
    
    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'Payments.user_id',
                    to: 'Users.id'
                }
            },
            session: {
                relation: Model.BelongsToOneRelation,
                modelClass: Session,
                join: {
                    from: 'Payments.session_id',
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
            'pay_form',
            'details',
            'paid_to',
            'ammount',
            'created_at',
            'updated_at'
        ];
    }
}

module.exports = Payment;