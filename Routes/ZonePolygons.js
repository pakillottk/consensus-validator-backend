const DBQuery = require( '../Database/Queries/DBQuery' );
const RecintZone = require('../Database/RecintZone');
const ZonePolygon = require( '../Database/ZonePolygon' );
const Session = require( '../Database/Session' );

module.exports = require( './ModelRouter' )( ZonePolygon, '', async ( req ) => {
    let { recint } = req.query;
    const { session } = req.query;
    const dbQuery = new DBQuery( ZonePolygon );

    dbQuery.join(
        RecintZone.tableName,
        ZonePolygon.listFields(ZonePolygon,['zone_id'],false)[0],
        RecintZone.listFields(RecintZone,['id'],false)[0]
    );

    if( session ) {
        const session_recint = await Session.query().where( 'id', '=', session );
        recint = session_recint[ 0 ].recint_id;
    }

    dbQuery.where().addClause( RecintZone.listFields(RecintZone,['recint_id' ],false)[0], '=', recint );
    
    return dbQuery;
});