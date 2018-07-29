const Type = require( '../Database/Type' );
const DBQuery = require( '../Database/Queries/DBQuery');
const CodeModel = require( '../Database/Code' );
const CodeController = require( '../Controllers/CodeController' )

module.exports = require( './ModelRouter' )( CodeModel, '[type, zone]', async ( req ) => {
    const queryParams = req.query;
    const dbQuery = new DBQuery( CodeModel );
    if( !queryParams.session ) {
        return dbQuery;
    }
    
    dbQuery.join(
        Type.tableName,
        CodeModel.listFields(CodeModel,['type_id'],false)[0],
        Type.listFields(Type,['id'],false)[0]
    );
    dbQuery.where().addClause( Type.listFields(Type,['session_id'],false)[0], '=', queryParams.session );
    
    const likeFields = {
        code: true,
        name: true,
        email: true
    };
    dbQuery.addAllReqParams( CodeModel.tableName, queryParams, { session: true }, likeFields );
    
    return dbQuery;
}, CodeController);