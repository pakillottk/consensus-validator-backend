const DBQuery = require( '../Database/Queries/DBQuery' );
const ScanGroupModel = require( '../Database/ScanGroup' );

module.exports = require( './ModelRouter' )( ScanGroupModel, '[session]', ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'session_id', '=', sessionId );

    return dbQuery;
} );