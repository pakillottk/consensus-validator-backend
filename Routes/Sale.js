const SaleModel = require( '../Database/Sales' );
const SaleController = require( '../Controllers/SaleController' )

const Code = require( '../Database/Code' );
const Type = require( '../Database/Type' );
const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = require( './ModelRouter' )( SaleModel, '[user, code]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const sessionId = req.query.session;
    if( !sessionId ) {
        return dbQuery;
    }
    
    const sessionTypes = await Type.query().where( 'session_id', '=', sessionId );
    const typeIds = [];
    sessionTypes.forEach( type => {
        typeIds.push( type.id );
    });
    const sessionCodes = await Code.query().where( 'type_id', 'in', typeIds );
    const codeIds = [];
    sessionCodes.forEach( code => {
        codeIds.push( code.id );
    });

    dbQuery.addClause( 'code_id', 'in', codeIds );

    return dbQuery;
}, SaleController, true, true );