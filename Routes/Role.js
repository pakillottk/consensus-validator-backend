const DBQuery = require( '../Database/Queries/DBQuery' );
const RoleModel = require( '../Database/Role' );
module.exports = require( './ModelRouter' )( RoleModel, '', ( req ) => {
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( RoleModel, user );
    if( user.role.role !== 'superadmin' ) {
        dbQuery.where().addClause( RoleModel.listFields( RoleModel, 'role',false ), '!=', 'superadmin' );
    }

    return dbQuery;
});