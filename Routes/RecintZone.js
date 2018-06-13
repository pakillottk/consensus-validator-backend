const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const RecintZoneModel = require( '../Database/RecintZone' );
module.exports = require( './ModelRouter' )( RecintZoneModel, '', async ( req ) => {
    const { recint, session } = req.query;
    const dbQuery = new DBQuery( req );
    //returns data only if recint or session selected
    if( !recint && !session ) {
        dbQuery.addClause( 'recint_id', '=', -1 );
        return dbQuery;
    }

    if( recint ) {
        dbQuery.addClause( 'recint_id', '=', recint );
    } else {
        const session_recint = await Session.query().where( 'id', '=', session );
        dbQuery.addClause( 'recint_id', '=', session_recint[0].recint_id );
    }

    return dbQuery;
});