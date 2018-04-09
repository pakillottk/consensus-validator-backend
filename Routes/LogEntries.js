const DBQuery = require( '../Database/Queries/DBQuery' );
const LogEntryModel = require( '../Database/LogEntry' );

module.exports = require( './ModelRouter' )( LogEntryModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const sessionId = req.query.session;
    if( !sessionId ) {
        return dbQuery;
    }

    dbQuery.addClause( 'session_id', '=', sessionId );
    return dbQuery;
});