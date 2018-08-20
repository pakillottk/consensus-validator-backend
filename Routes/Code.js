const CheckScope = require('../Auth/CheckScope');
const Type = require( '../Database/Type' );
const DBQuery = require( '../Database/Queries/DBQuery');
const CodeModel = require( '../Database/Code' );
const CodeController = require( '../Controllers/CodeController' )

const INCLUDING = '[type, zone]'
const Router = require( './ModelRouter' )( CodeModel, INCLUDING, async ( req ) => {
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

Router.post('/generate/:ammount', CheckScope( CodeModel.name, 'post' ), async ( req, res ) => {
    const ammount = parseInt(req.params.ammount,10)
    if( !ammount || ammount < 0 ) {
        res.status( 400 ).send("Ammount must be > 0");
    } else {
        try {
            const codes = await Router.controller.generateCodes( ammount, req.body.type_id, req.body.session_id, INCLUDING )
            res.status(200).send( JSON.stringify( codes ) )
        } catch( e ) {
            res.status(400).send( e )
        } 
    }
})

module.exports = Router;