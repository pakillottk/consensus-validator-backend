const DBQuery = require( '../Database/Queries/DBQuery' );
const RoleModel = require( '../Database/Role' );
module.exports = require( './ModelRouter' )( RoleModel, '', ( req ) => {
    const dbQuery = new DBQuery( req );
    const user = req.res.locals.oauth.token.user;
    if( user.role.role !== 'superadmin' ) {
        dbQuery.addClause( 'role', '<>', 'superadmin' );
    }

    return dbQuery;
});