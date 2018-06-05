const DBQuery = require( '../Database/Queries/DBQuery' );
const RecintModel = require( '../Database/Recint' );
module.exports = require( './ModelRouter' )( RecintModel, '', ( req ) => {
    const dbQuery = new DBQuery( req );
    dbQuery.addAllReqParams( 
        req.query, 
        {},
        {
            recint: true,
            location: true,
            address: true
        },
        {} 
    ); 

    return dbQuery;
});