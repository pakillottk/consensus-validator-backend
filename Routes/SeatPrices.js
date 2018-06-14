const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const SeatPriceModel = require( '../Database/SeatPrice' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );

module.exports = require( './ModelRouter' )( SeatPriceModel, '[zone, type]', async ( req ) => {
    const { session } = req.query;
    let recint;
    const dbQuery = new DBQuery( req );
    //returns data only if session is selected
    if( !session ) {
        dbQuery.addClause( 'zone_id', '=', -1 );
        return dbQuery;
    }
    const session_recint = await Session.query().where( 'id', '=', session );
    recint = session_recint[ 0 ].recint_id;
    
    const zones = await QueryRecintZones( recint, true, true );
    dbQuery.addClause( 'zone_id', 'in', zones );
    dbQuery.addClause( 'session_id', '=', session );

    return dbQuery;
});