const DBQuery = require( '../Database/Queries/DBQuery' );
const TypeModel = require( '../Database/Type' );

module.exports = require( './ModelRouter' )( TypeModel, '', ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'session_id', '=', sessionId );

    return dbQuery;
} );