const DBQuery = require( '../Database/Queries/DBQuery' );
const UserModel = require( '../Database/User' );

module.exports = require( './ModelRouter' )( UserModel, '[role, company]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    dbQuery.addAllReqParams( req.query, {}, { username: true } );

    return dbQuery;    
}, null, false, false, true );