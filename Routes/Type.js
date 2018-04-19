const DBQuery = require( '../Database/Queries/DBQuery' );
const TypeModel = require( '../Database/Type' );
const Deliver = require( '../Database/Deliver' );
const UserScanGroup = require('../Database/UserScanGroup');
const ScanGroup = require('../Database/ScanGroup');
const ScanType = require('../Database/ScanType');

module.exports = require( './ModelRouter' )( TypeModel, '', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'session_id', '=', sessionId );

    const userId   = req.res.locals.oauth.token.user.id;
    const userRole = req.res.locals.oauth.token.user.role.role;
    if( userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'scanner' ) {
        const deliveredTypes = await Deliver.query().where( 'user_id', '=', userId );
        const typeIds = [];
        deliveredTypes.forEach( deliver => {
            typeIds.push( deliver.type_id );
        });

        dbQuery.addClause( 'id', 'in', typeIds );
    } else if ( userRole === 'scanner' ) {
        //Get session groups
        const sessionGroups = await ScanGroup.query().select('id').where( 'session_id', '=', sessionId );
        const sessionIds = [];
        sessionGroups.forEach( group => {
            sessionIds.push( group.id );
        })
        if( sessionIds.length === 0 ) {
            dbQuery.addClause( 'id', '=', -1);
            return dbQuery;
        }
        
        //Get user group
        const userGroup = await UserScanGroup.query().select('group_id')
                                .whereIn( 'group_id', sessionIds )
                                .andWhere( 'user_id', '=', userId );

        if( userGroup.length === 0 ) {
            dbQuery.addClause( 'id', '=', -1);
            return dbQuery;
        }
        //Get types in group
        const availableTypes = await ScanType.query().select('type_id').where( 'group_id', '=', userGroup[0].group_id );
        const typesIds = [];    
        availableTypes.forEach( type => {
            typesIds.push( type.type_id );
        });
        //query only types in group
        dbQuery.addClause( 'id', 'in', typesIds );
    }

    return dbQuery;
} );