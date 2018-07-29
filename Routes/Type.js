const DBQuery = require( '../Database/Queries/DBQuery' );
const TypeModel = require( '../Database/Type' );
const Deliver = require( '../Database/Deliver' );
const Session = require( '../Database/Session' );
const ScanGroup = require( '../Database/ScanGroup');
const UserScanGroup = require( '../Database/UserScanGroup');
const ScanType = require( '../Database/ScanType');
const SessionSupervisor = require('../Database/SessionSupervisor');

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
        //get only the scanneable types
        const groupQuery = new DBQuery( ScanGroup );
        groupQuery.setSelect( TypeModel.listFields( TypeModel ) )
        groupQuery.join(
            UserScanGroup.tableName,
            ScanGroup.listFields( ScanGroup,['id'],false )[0],
            UserScanGroup.listFields( UserScanGroup,['group_id'],false )[0]
        );
        groupQuery.join(
            ScanType.tableName,
            ScanGroup.listFields( ScanGroup,['id'],false )[0],
            ScanType.listFields( ScanType,['group_id'],false )[0]
        );
        groupQuery.join(
            TypeModel.tableName,
            ScanType.listFields( ScanType,['type_id'],false )[0],
            TypeModel.listFields( TypeModel,['id'],false )[0]
        );
        groupQuery.where()
                    .addClause( 
                        UserScanGroup.listFields( UserScanGroup,['user_id'],false )[0],
                        '=',
                        userId
                    )
                    .addClause(
                        ScanGroup.listFields( ScanGroup,['session_id'],false )[0],
                        '=',
                        sessionId
                    );

        return groupQuery;
    } else if( 'supervisor' === userRole ) {
        dbQuery.join(
            SessionSupervisor.tableName,
            TypeModel.listFields(TypeModel,['session_id'],false)[0],
            SessionSupervisor.listFields(SessionSupervisor,['session_id'],false)[0]
        );
        dbQuery.where().addClause( SessionSupervisor.listFields(SessionSupervisor,['user_id'],false)[0],'=',userId );
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