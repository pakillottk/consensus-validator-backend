const Type = require( '../Database/Type' );
const CodeModel = require( '../Database/Code' );

module.exports = require( './ModelRouter' )( CodeModel, '[type]', async ( req ) => {
    const sessionId = req.query.session;
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