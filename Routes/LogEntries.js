const DBQuery = require( '../Database/Queries/DBQuery' );
const LogEntryModel = require( '../Database/LogEntry' );

module.exports = require( './ModelRouter' )( LogEntryModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( LogEntryModel );
    const sessionId = req.query.session;
    if( !sessionId ) {
        return dbQuery;
    }
    dbQuery.where().addClause( LogEntryModel.listFields(LogEntryModel,['session_id'],false)[0], '=', sessionId );
    
    dbQuery.addAllReqParams( 
        LogEntryModel.tableName,
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

    return dbQuery;
});