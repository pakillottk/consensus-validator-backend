const DBQuery = require('../Database/Queries/DBQuery');
const CompanyModel = require( '../Database/Company' );
const CompanyController = require('../Controllers/CompanyController');

module.exports = require( './ModelRouter' )( 
    CompanyModel, 
    '', 
    async ( req ) => {
        const user = req.res.locals.oauth.token.user;
        const dbQuery = new DBQuery( CompanyModel );
        if( ['admin','supervisor'].includes( user.role.role ) ) {
            dbQuery.where().addClause( CompanyModel.listFields(CompanyModel, ['id'], false)[0], '=', user.company_id );
        }
        if( Object.keys(req.query).length > 0 ) {
            dbQuery.addAllReqParams( 
                CompanyModel.tableName,
                req.query, 
                {}, 
                { name: true, nif: true, address: true, phone: true, email: true }
            );
        }
        return dbQuery;    
    },
    CompanyController,
    false,
    false,
    false,
    {}
);