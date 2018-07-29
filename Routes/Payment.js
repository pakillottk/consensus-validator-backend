const PaymentModel = require( '../Database/Payment' );
const Session = require('../Database/Session');
const SessionSupervisor = require('../Database/SessionSupervisor');
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( PaymentModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( PaymentModel );
    const user = req.res.locals.oauth.token.user;
    const sessionId = req.query.session;

    if( 'supervisor' === user.role.role ) {
        dbQuery.join(
            SessionSupervisor.tableName,
            PaymentModel.listFields( PaymentModel, ['session_id'], false )[0],
            SessionSupervisor.listFields( SessionSupervisor, ['session_id'], false )[0],
        );
        dbQuery.where().addClause( SessionSupervisor.listFields( SessionSupervisor,['user_id'],false )[0],'=',user.id );
    }

    if( sessionId ) {
        dbQuery.where().addClause( PaymentModel.listFields(PaymentModel,['session_id'],false)[0], '=', sessionId );
    } else { 
        if( user.role.role === 'ticketoffice-manager' || user.role.role === 'seller' ) {
            dbQuery.where().addClause( PaymentModel.listFields(PaymentModel,['user_id'],false)[0], '=', user.id );
        } else if( user.role.role !== 'superadmin' ) {
            dbQuery.join(
                Session.tableName,
                PaymentModel.listFields(PaymentModel,['session_id'],false)[0],
                Session.listFields(Session,['id'],false)[0]
            );
            dbQuery.where().addClause( Session.listFields(Session,['company_id'],false)[0], '=', user.company_id );
        }
    }

    dbQuery.addAllReqParams( 
        PaymentModel.tableName,
        req.query, 
        { 
            session: true,
            to_date: true 
        },
        {
            paid_to: true
        },
        {
            from_date: {
                field: 'created_at',
                min: req.query.from_date,
                max: req.query.to_date || new Date()
            }
        } 
    );

    return dbQuery;
}, null, true);