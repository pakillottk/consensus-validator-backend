const DBQuery = require( '../Database/Queries/DBQuery' );
const SeatReserve = require( '../Database/SeatReserve' );

module.exports = require( './ModelRouter' )( SeatReserve, '', async ( req ) => {
    const { session } = req.query;
    const dbQuery = new DBQuery( req );
    //returns data only if session selected
    dbQuery.addClause( 'session_id', '=', session ? session : -1 )
    
    return dbQuery;
});