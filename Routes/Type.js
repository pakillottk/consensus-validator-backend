const DBQuery = require( '../Database/Queries/DBQuery' );
const TypeModel = require( '../Database/Type' );
const Deliver = require( '../Database/Deliver' );
const Session = require( '../Database/Session' );

module.exports = require( './ModelRouter' )( TypeModel, '', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( TypeModel );
    if( sessionId ) {
        dbQuery.where().addClause( TypeModel.listFields(TypeModel,['session_id'],false)[0], '=', sessionId );
    }

    const userId        = req.res.locals.oauth.token.user.id;
    const userRole      = req.res.locals.oauth.token.user.role.role;
    const userCompany   = req.res.locals.oauth.token.user.company_id;
    if( userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'scanner' ) {
        //get types that have deliveries to user
        const deliveries = new DBQuery( Deliver );
        deliveries.join(
            TypeModel.tableName,
            Deliver.listFields(Deliver,['type_id'],false)[0],
            TypeModel.listFields(TypeModel,['id'],false)[0]
        );
        deliveries.where().addClause( Deliver.listFields(Deliver,['user_id'],false)[0],'=',userId );
        const types = await deliveries.run().map( del => del.type_id );
        dbQuery.where().addClause( TypeModel.listFields( TypeModel, ['id'],false)[0], 'in', types );
    } else if ( userRole === 'scanner' ) {
        //TODO: Get session groups 
        /*const sessionGroups = await ScanGroup.query().select('id').where( 'session_id', '=', sessionId );
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
        dbQuery.addClause( 'id', 'in', typesIds );*/
    } else if( userCompany ) {
        dbQuery.join(
            Session.tableName,
            TypeModel.listFields(TypeModel,['session_id'],false)[0],
            Session.listFields(Session,['id'],false)[0]
        );
        dbQuery.where().addClause( Session.listFields(Session,['company_id'],false)[0], '=', userCompany );
    }

    return dbQuery;
} );