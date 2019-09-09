const SaleModel = require( '../Database/Sales' );
const SaleController = require( '../Controllers/SaleController' )

const Code = require( '../Database/Code' );
const Type = require( '../Database/Type' );
const Session = require('../Database/Session');
const SessionSupervisor = require('../Database/SessionSupervisor');
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( SaleModel, '[user, code.[type, zone]]', async ( req ) => {
    const dbQuery = new DBQuery( SaleModel );
    const user = req.res.locals.oauth.token.user;
    const sessionId = req.query.session;

    dbQuery.join(
        Code.tableName,
        SaleModel.listFields(SaleModel,['code_id'],false)[0],
        Code.listFields(Code,['id'],false)[0]
    );
    dbQuery.join(
        Type.tableName,
        Code.listFields(Code,['type_id'],false)[0],
        Type.listFields(Type,['id'],false)[0]
    );

    dbQuery.addAllReqParams( 
        SaleModel.tableName,
        req.query, 
        { 
            session: true,
            to_sale_date: true,
            code: true,
            username: true
        },
        {},
        {
            from_sale_date: {
                field: 'created_at',
                min: req.query.from_sale_date,
                max: req.query.to_sale_date || new Date()
            }
        } 
    );

    if( 'supervisor' === user.role.role ) {
        dbQuery.join(
            SessionSupervisor.tableName,
            Type.listFields(Type,['session_id'],false)[0],
            SessionSupervisor.listFields(SessionSupervisor,['session_id'],false)[0],
        );
        dbQuery.where().addClause( SessionSupervisor.listFields(SessionSupervisor,['user_id'],false)[0], '=', user.id );
    }

    if( ['seller','ticketoffice-manager'].includes(user.role.role) ) {
        dbQuery.where().addClause( SaleModel.listFields(SaleModel,['user_id'],false)[0], '=', user.id );
    }     
    
    if( !sessionId ) {
        if( user.company_id && user.role.role !== 'superadmin' && user.role.role !== 'supervisor' ) {  
           dbQuery.join(
                Session.tableName,
                Type.listFields(Type,['session_id'],false)[0],
                Session.listFields(Session,['id'],false)[0]
           );
           dbQuery.where().addClause( Session.listFields(Session,['company_id'],false)[0], '=', user.company_id );
        } 

        return dbQuery;
    } 

    dbQuery.where().addClause( Type.listFields(Type,['session_id'],false)[0], '=', sessionId );

    return dbQuery;
}, SaleController, true, true );