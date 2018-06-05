const DBQuery = require( '../Database/Queries/DBQuery' );
const RecintZoneModel = require( '../Database/RecintZone' );
module.exports = require( './ModelRouter' )( RecintZoneModel, '', ( req ) => {
    const { recint } = req.query;
    const dbQuery = new DBQuery( req );
    //returns data only if recint selected
    dbQuery.addClause( 'recint_id', '=', recint ? recint : -1 );

    return dbQuery;
});