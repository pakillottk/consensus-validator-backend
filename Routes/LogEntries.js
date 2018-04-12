const DBQuery = require( '../Database/Queries/DBQuery' );
const LogEntryModel = require( '../Database/LogEntry' );

module.exports = require( './ModelRouter' )( LogEntryModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const sessionId = req.query.session;
    if( !sessionId ) {
        return dbQuery;
    }

    dbQuery.addAllReqParams( 
        req.query, 
        { session: true, from_date: true, to_date: true }, 
        {msg: true}, 
        {
            from_date: {
                field: 'date',
                min: req.query.from_date,
                max: req.query.to_date || new Date()
            }
        }
    );

    dbQuery.addClause( 'session_id', '=', sessionId );
    return dbQuery;
});