const DBQuery = require('../Database/Queries/DBQuery');
const CompanyModel = require( '../Database/Company' );

module.exports = require( './ModelRouter' )( CompanyModel, '', async ( req ) => {
    const dbQuery = new DBQuery( req );
    dbQuery.addAllReqParams( 
        req.query, 
        {}, 
        { name: true, nif: true, address: true, phone: true, email: true }
    );

    return dbQuery;    
});