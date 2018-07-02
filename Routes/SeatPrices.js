const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const SeatPriceModel = require( '../Database/SeatPrice' );
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
    dbQuery.addClause( 'session_id', '=', session );

    if( !['superadmin', 'admin', 'supervisor'].includes( userRole ) ) {
        const deliveredTypes = await Deliver.query().where( 'user_id', '=', userId );
        const typeIds = [];
        deliveredTypes.forEach( deliver => {
            typeIds.push( deliver.type_id );
        });

        dbQuery.addClause( 'type_id', 'in', typeIds );
    } 

    return dbQuery;
});