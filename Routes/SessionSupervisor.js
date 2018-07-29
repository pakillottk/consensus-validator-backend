const SessionSupervisor = require( '../Database/SessionSupervisor' );
const DBQuery = require( '../Database/Queries/DBQuery');

module.exports = require( './ModelRouter' )( SessionSupervisor, '[user]', async ( req ) => {
    const queryParams = req.query;
    const dbQuery = new DBQuery( SessionSupervisor );
    if( !queryParams.session ) {
        return dbQuery;
    }
    
    dbQuery.where().addClause( SessionSupervisor.listFields(SessionSupervisor,['session_id'],false)[0], '=', queryParams.session );
    
    return dbQuery;
});