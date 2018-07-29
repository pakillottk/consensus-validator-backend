const DBQuery = require( '../Database/Queries/DBQuery' );
const ScanGroupModel = require( '../Database/ScanGroup' );

module.exports = require( './ModelRouter' )( ScanGroupModel, '[session]', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( ScanGroupModel );
    dbQuery.where().addClause( ScanGroupModel.listFields(ScanGroupModel,['session_id'],false)[0], '=', sessionId );

    return dbQuery;
}, null, false, false, false );