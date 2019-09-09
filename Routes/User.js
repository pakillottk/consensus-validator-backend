const DBQuery = require( '../Database/Queries/DBQuery' );
const UserModel = require( '../Database/User' );
const Role = require('../Database/Role');
const Company = require('../Database/Company');

module.exports = require( './ModelRouter' )( UserModel, '[role, company]', async ( req ) => {
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( UserModel, user );
    dbQuery.join( 
        Role.tableName, 
        UserModel.listFields( UserModel, ['role_id'], false )[0], 
        Role.listFields( Role, ['id'], false )[0],
        'left'
    );
    dbQuery.join(
        Company.tableName,
        UserModel.listFields( UserModel, ['company_id'], false )[0], 
        Company.listFields( Company, ['id'], false )[0],
        'left' 
    );
    dbQuery.setSelect( UserModel.listFields( UserModel, ['password'] ) );
    if( ['supervisor','admin'].includes( user.role.role ) ) {        
        dbQuery.where().addClause( UserModel.listFields(UserModel,['company_id'],false)[0], '=', user.company_id )
        .addClause( Role.listFields(Role,['role'],false)[0], 'in', ['seller','ticketoffice-manager','scanner'], 'or' );
    } else if( user.role.role !== 'superadmin' ) {
        dbQuery.where().addClause( UserModel.listFields(UserModel,['id'],false)[0], '=', user.id );
    }
    dbQuery.addAllReqParams( UserModel.tableName, req.query, {}, { username: true } );
    dbQuery.orderBy(UserModel.getField(UserModel, "username"), "asc");
    return dbQuery;    
}, null, false, false, true );