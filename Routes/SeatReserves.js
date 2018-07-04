const DBQuery = require( '../Database/Queries/DBQuery' );
const SeatReserve = require( '../Database/SeatReserve' );
const SeatReserveController = require( '../Controllers/SeatReserveController' );

module.exports = require( './ModelRouter' )( SeatReserve, '[zone, user]', async ( req ) => {
    const { session } = req.query;
    const dbQuery = new DBQuery( SeatReserve );
    //returns data only if session selected
    dbQuery.where().addClause( SeatReserve.listFields( SeatReserve,['session_id'],false )[0] , '=', session ? session : -1 )
    
    return dbQuery;
}, SeatReserveController, false, true );