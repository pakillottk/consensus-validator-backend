const PaymentModel = require( '../Database/Payment' );
const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryCompanySessions = require('../Database/Queries/Sessions/QueryCompanySessions');

module.exports = require( './ModelRouter' )( PaymentModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const user = req.res.locals.oauth.token.user;
    const sessionId = req.query.session;
    dbQuery.addAllReqParams( 
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

    if( sessionId ) {
        dbQuery.addClause( 'session_id', '=', sessionId );
    } else { 
        if( user.role.role === 'ticketoffice-manager' || user.role.role === 'supervisor' ) {
            dbQuery.addClause( 'user_id', '=', user.id );
        } else if( user.role.role !== 'superadmin' ) {
            const sessionIds = await QueryCompanySessions( user.company_id, true, true );
            dbQuery.addClause( 'session_id', 'in', sessionIds );
        }
    }

    return dbQuery;
}, null, true);