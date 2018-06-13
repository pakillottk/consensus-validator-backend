const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const Session = require( '../Database/Session' );
const SeatRowModel = require( '../Database/SeatRow' );

module.exports = require( './ModelRouter' )( SeatRowModel, '', async ( req ) => {
    let { recint } = req.query;
    const { session } = req.query;
    const dbQuery = new DBQuery( req );
    //returns data only if recint selected
    if( session ) {
        const session_recint = await Session.query().where( 'id', '=', session );
        recint = session_recint[ 0 ].recint_id;
    }
    const zones = await QueryRecintZones( recint, true, true );
    dbQuery.addClause( 'zone_id', 'in', zones );

    return dbQuery;
});