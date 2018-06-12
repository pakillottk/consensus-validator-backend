const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const ZonePolygon = require( '../Database/ZonePolygon' );
module.exports = require( './ModelRouter' )( ZonePolygon, '', async ( req ) => {
    const { recint } = req.query;
    const dbQuery = new DBQuery( req );
    //returns data only if recint selected
    const zones = await QueryRecintZones( recint, true, true );
    dbQuery.addClause( 'zone_id', 'in', zones );

    return dbQuery;
});