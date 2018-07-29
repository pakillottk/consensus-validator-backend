const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const RecintZoneModel = require( '../Database/RecintZone' );
module.exports = require( './ModelRouter' )( RecintZoneModel, '', async ( req ) => {
    const { recint, session } = req.query;
    const dbQuery = new DBQuery( RecintZoneModel );
    //returns data only if recint or session selected
    if( !recint && !session ) {
        dbQuery.where().addClause( RecintZoneModel.listFields(RecintZoneModel,['recint_id'],false)[0], '=', -1 );
        return dbQuery;
    }

    if( recint ) {
        dbQuery.where().addClause( RecintZoneModel.listFields(RecintZoneModel,['recint_id'],false)[0], '=', recint );
    } else {
        const session_recint = await Session.query().where( 'id', '=', session );
        dbQuery.where().addClause( RecintZoneModel.listFields(RecintZoneModel,['recint_id'],false)[0], '=', session_recint[0].recint_id );
    }

    return dbQuery;
});