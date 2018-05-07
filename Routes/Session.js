const DBQuery = require('../Database/Queries/DBQuery');
const SessionModel = require( '../Database/Session' );
const QueryUserDelivers = require('../Database/Queries/Delivers/QueryUserDelivers');
const Type = require('../Database/Type');

module.exports = require( './ModelRouter' )( SessionModel, '[company]', async ( req ) => {
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( req );
    dbQuery.addAllReqParams( 
        req.query, 
        { to_date: true }, 
        { name: true, recint: true, location: true },
        {
            from_date: {
                field: 'date',
                min: req.query.from_date,
                max: req.query.to_date || new Date()
            }
        }  
    );

    //Show only sessions with delivered tickets
    if( [ 'seller', 'ticketoffice-manager' ].includes( user.role.role ) ) {
        const typeIds = await QueryUserDelivers( user.id, true, false, 'type_id' );
        const types = await Type.query().whereIn('id', typeIds);
        const typesDeliveredSessionId = [];
        types.forEach( type => {
            typesDeliveredSessionId.push( type.session_id );
        });
        dbQuery.addClause( 'id', 'in', typesDeliveredSessionId );
    }

    return dbQuery;    
}, null, false, false, true );