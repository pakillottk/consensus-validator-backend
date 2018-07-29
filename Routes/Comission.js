const ComissionModel = require( '../Database/Comission' );
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( ComissionModel, '[user]', async ( req ) => {
    const dbQuery = new DBQuery( ComissionModel );
    const sessionId = req.query.session;
    const user = req.res.locals.oauth.token.user;
    if( sessionId ) {
        dbQuery.where().addClause( ComissionModel.listFields(ComissionModel,['session_id'],false)[0], '=', sessionId );
    }
    //filter only own comissions
    if( !['superadmin','admin','supervisor'].includes( user.role.role ) ) {
        dbQuery.where().addClause( ComissionModel.listFields(ComissionModel,['user_id'],false)[0],'=',user.id );
    }

    return dbQuery;
});