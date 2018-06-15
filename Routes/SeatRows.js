const DBQuery = require( '../Database/Queries/DBQuery' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const Session = require( '../Database/Session' );
const SeatRowModel = require( '../Database/SeatRow' );

module.exports = require( './ModelRouter' )( SeatRowModel, '', async ( req ) => {
    let { recint } = req.query;
    const { session } = req.query;
    const dbQuery = new DBQuery( req );
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
    const zones = await QueryRecintZones( recint, true, true );
    dbQuery.addClause( 'zone_id', 'in', zones );

    return dbQuery;
});