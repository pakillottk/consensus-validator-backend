const DBQuery = require( '../Database/Queries/DBQuery' );
const UserModel = require( '../Database/User' );
const Role = require('../Database/Role');

module.exports = require( './ModelRouter' )( UserModel, '[role, company]', async ( req ) => {
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( req );

    dbQuery.addAllReqParams( req.query, {role_id: true, company_id: true}, { username: true } );
    
    let roles = await Role.query().whereIn('role',['seller','ticketoffice-manager','scanner']);
    roles = roles.map( role => role.id );
    if( ['supervisor','admin'].includes( user.role.role ) ) {
        dbQuery.addClause( 'company_id', '=', user.company_id );
        dbQuery.addClause( 'role_id', 'in', roles, 'or' )
    }

    return dbQuery;    
}, null, false, false, true );