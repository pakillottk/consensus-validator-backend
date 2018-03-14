const Type = require( '../Database/Type' );
const DBQuery = require( '../Database/Queries/DBQuery');
const CodeModel = require( '../Database/Code' );
const CodeController = require( '../Controllers/CodeController' )

module.exports = require( './ModelRouter' )( CodeModel, '[type]', async ( req ) => {
    const likeFields = {
        code: true,
        name: true,
        email: true
    }
    const queryParams = req.query;
    const dbQuery = new DBQuery( req );

    Object.keys( queryParams ).forEach( param => {
        if( param === "session" ) {
            return;
        }
        const value = queryParams[ param ];
        if( likeFields[ param ] ) {
            dbQuery.addClause( param, 'like', '%' + value + '%' );
        } else {
            dbQuery.addClause( param, '=', value );
        }
    });

    if( !queryParams.session ) {
        return dbQuery;
    }
    const sessionTypes = await Type.query().select('id').where( 'session_id', queryParams.session );
    const typesArray = [];
    sessionTypes.forEach( type => {
        typesArray.push( type.id );
    });
    
    dbQuery.addClause( 'type_id', 'in', typesArray );

    return dbQuery;
}, CodeController);