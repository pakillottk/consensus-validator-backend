const PaymentModel = require( '../Database/Payment' );
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( PaymentModel, '', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const user = req.res.locals.oauth.token.user;
    const sessionId = req.query.session;
    dbQuery.addAllReqParams( 
        req.query, 
        { 
            session: true,
            to_date: true 
        },
        {},
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
    }

    return dbQuery;
}, null, true);