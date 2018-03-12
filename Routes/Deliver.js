const DBQuery = require( '../Database/Queries/DBQuery' );
const DeliverModel = require( '../Database/Deliver' );
const Type = require( '../Database/Type' );

module.exports = require( './ModelRouter' )( DeliverModel, '[user, type]', async ( req ) => {
    const sessionId = req.query.session;
    const user = req.res.locals.oauth.token.user;
    if( !sessionId ) {
        return new DBQuery( req );
    }
    
    const sessionTypes = await Type.query().select('id').where( 'session_id', sessionId );
    const typesArray = [];
    sessionTypes.forEach( type => {
        typesArray.push( type.id );
    });
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'type_id', 'in', typesArray );

    return dbQuery;
});