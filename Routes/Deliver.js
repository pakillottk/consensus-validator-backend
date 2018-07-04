const DBQuery = require( '../Database/Queries/DBQuery' );
const DeliverModel = require( '../Database/Deliver' );
const Type = require( '../Database/Type' );
const DeliverController = require( '../Controllers/DeliverController' );

module.exports = require( './ModelRouter' )( DeliverModel, '[user, type]', async ( req ) => {
    const sessionId = req.query.session;
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( DeliverModel );
    if( !sessionId ) {
        return new DBQuery( DeliverModel );
    }
    dbQuery.join(
        Type.tableName,
        DeliverModel.listFields(DeliverModel,['type_id'],false)[0],
        Type.listFields(Type,['id'],false)[0]
    );
    dbQuery.where().addClause( Type.listFields(Type,['session_id'],false)[0], '=', sessionId );
    if( !['superadmin','admin','supervisor'].includes( user.role.role ) ) {
        //filter only own deliveries
        dbQuery.where().addClause( DeliverModel.listFields(DeliverModel,['user_id'],false)[0], '=', user.id );
    }

    return dbQuery;
}, DeliverController, true);