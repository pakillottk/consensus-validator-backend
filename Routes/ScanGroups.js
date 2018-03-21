const DBQuery = require( '../Database/Queries/DBQuery' );
const ScanGroupModel = require( '../Database/ScanGroup' );

module.exports = require( './ModelRouter' )( ScanGroupModel, '[session]', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'session_id', '=', sessionId );

    //TODO: FILTER USER GROUP AND COMPANY SESSIONS

    return dbQuery;
}, null, false, false, false );