const ComissionModel = require( '../Database/Comission' );
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( ComissionModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const sessionId = req.query.session;
    if( sessionId ) {
        dbQuery.addClause( 'session_id', '=', sessionId );
    }

    return dbQuery;
});