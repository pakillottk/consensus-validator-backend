const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const Session = require( '../Database/Session' );
const SeatRowModel = require( '../Database/SeatRow' );
const RecintZone = require('../Database/RecintZone');

module.exports = require( './ModelRouter' )( SeatRowModel, '', async ( req ) => {
    let { recint } = req.query;
    const { session } = req.query;
    const dbQuery = new DBQuery( SeatRowModel );
    //returns data only if recint selected
    const userRole      = req.res.locals.oauth.token.user.role.role;
    const userCompany   = req.res.locals.oauth.token.user.company_id;
    
    if( session ) {
        let session_recint; 
        if( userRole === 'superadmin' ) {
            session_recint = await Session.query().where( 'id', '=', session );
        } else {
            session_recint = await Session.query()
                                                .where( 'id', '=', session )
                                                .andWhere('company_id','=',userCompany);
        }
        recint = session_recint.length > 0 ? session_recint[ 0 ].recint_id : -1;
    }

    dbQuery.join(
        RecintZone.tableName,
        SeatRowModel.listFields(SeatRowModel,['zone_id'],false)[0],
        RecintZone.listFields(RecintZone,['id'],false)[0]
    );
    dbQuery.where().addClause( RecintZone.listFields(RecintZone,['recint_id' ],false)[0], '=', recint );

    return dbQuery;
});