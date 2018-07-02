const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const ZonePolygon = require( '../Database/ZonePolygon' );
const Session = require( '../Database/Session' );

module.exports = require( './ModelRouter' )( ZonePolygon, '', async ( req ) => {
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
    console.log( dbQuery.clauses )
    return dbQuery;
});