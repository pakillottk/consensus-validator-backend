const DBQuery = require( '../Database/Queries/DBQuery' );
const Session = require( '../Database/Session' );
const SeatPriceModel = require( '../Database/SeatPrice' );
const Deliver = require( '../Database/Deliver' );

module.exports = require( './ModelRouter' )( SeatPriceModel, '[zone, type]', async ( req ) => {
    const { session } = req.query;
    const dbQuery = new DBQuery( SeatPriceModel );
    //returns data only if session is selected
    if( !session ) {
        dbQuery.where().addClause( SeatPriceModel.listFields(SeatPriceModel,['session_id'],false)[0], '=', -1 );
        return dbQuery;
    }
    const userId        = req.res.locals.oauth.token.user.id;
    const userRole      = req.res.locals.oauth.token.user.role.role;
    dbQuery.where().addClause( SeatPriceModel.listFields(SeatPriceModel,['session_id'],false)[0], '=', session );

    if( !['superadmin', 'admin', 'supervisor'].includes( userRole ) ) {
        const deliveredTypes = await Deliver.query().where( 'user_id', '=', userId );
        const typeIds = [];
        deliveredTypes.forEach( deliver => {
            typeIds.push( deliver.type_id );
        });

        dbQuery.where().addClause( SeatPriceModel.listFields(SeatPriceModel,['type_id'],false)[0], 'in', typeIds );
    } 

    return dbQuery;
});