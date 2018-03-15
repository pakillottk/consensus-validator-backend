const DBQuery = require( '../Database/Queries/DBQuery' );
const TypeModel = require( '../Database/Type' );
const Deliver = require( '../Database/Deliver' );

module.exports = require( './ModelRouter' )( TypeModel, '', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'session_id', '=', sessionId );

    const userId   = req.res.locals.oauth.token.user.id;
    const userRole = req.res.locals.oauth.token.user.role.role;
    if( userRole !== 'superadmin' && userRole !== 'admin' ) {
        const deliveredTypes = await Deliver.query().where( 'user_id', '=', userId );
        const typeIds = [];
        deliveredTypes.forEach( deliver => {
            typeIds.push( deliver.type_id );
        });

        dbQuery.addClause( 'id', 'in', typeIds );
    }

    return dbQuery;
} );