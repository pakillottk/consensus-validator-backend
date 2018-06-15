const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const SeatPriceModel = require( '../Database/SeatPrice' );
const QueryRecintZones = require( '../Database/Queries/RecintZones/QueryRecintZones' );
const Deliver = require( '../Database/Deliver' );

module.exports = require( './ModelRouter' )( SeatPriceModel, '[zone, type]', async ( req ) => {
    const { session } = req.query;
    let recint;
    const dbQuery = new DBQuery( req );
    //returns data only if session is selected
    if( !session ) {
        dbQuery.addClause( 'zone_id', '=', -1 );
        return dbQuery;
    }
    const userId        = req.res.locals.oauth.token.user.id;
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
    dbQuery.addClause( 'session_id', '=', session );

    if( userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'supervisor' ) {
        const deliveredTypes = await Deliver.query().where( 'user_id', '=', userId );
        const typeIds = [];
        deliveredTypes.forEach( deliver => {
            typeIds.push( deliver.type_id );
        });

        dbQuery.addClause( 'type_id', 'in', typeIds );
    } 

    return dbQuery;
});