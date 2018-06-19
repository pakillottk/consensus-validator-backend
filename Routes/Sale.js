const SaleModel = require( '../Database/Sales' );
const SaleController = require( '../Controllers/SaleController' )

const Code = require( '../Database/Code' );
const Type = require( '../Database/Type' );
const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryCompanySessions = require('../Database/Queries/Sessions/QueryCompanySessions');
const QuerySessionsTypes = require('../Database/Queries/Types/QuerySessionsTypes');
const QueryTypesCodes = require('../Database/Queries/Codes/QueryTypesCodes');
const QueryByCode = require('../Database/Queries/Codes/QueryByCode');

module.exports = require( './ModelRouter' )( SaleModel, '[user, code.[type, zone]]', async ( req ) => {
    const dbQuery = new DBQuery( req );
    const user = req.res.locals.oauth.token.user;
    const sessionId = req.query.session;
    dbQuery.addAllReqParams( 
        req.query, 
        { 
            session: true,
            to_sale_date: true,
            code: true
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

    if( !sessionId ) {
        if( user.company_id && user.role.role !== 'superadmin' ) {
            const sessionIds = await QueryCompanySessions( user.company_id, true, true );
            const typesIds = await QuerySessionsTypes( sessionIds, true, true );
            let codesIds;
            if( req.query.code ) {
                codesIds = await QueryByCode( req.query.code, typesIds, true, true );
            } else {
                codesIds = await QueryTypesCodes( typesIds, true, true );
            }
            dbQuery.addClause( 'code_id', 'in', codesIds );
        }
        return dbQuery;
    }     
    
    const sessionTypes = await Type.query().where( 'session_id', '=', sessionId );
    const typeIds = [];
    sessionTypes.forEach( type => {
        typeIds.push( type.id );
    });
    let sessionCodes;
    if( req.query.code ) {
        sessionCodes = await Code.query()
                        .where( 'type_id', 'in', typeIds )
                        .andWhere( 'code', 'like', '%'+req.query.code+'%' );

    } else {
        sessionCodes = await Code.query().where( 'type_id', 'in', typeIds );
    }

    const codeIds = [];
    sessionCodes.forEach( code => {
        codeIds.push( code.id );
    });

    dbQuery.addClause( 'code_id', 'in', codeIds );

    return dbQuery;
}, SaleController, true, true );