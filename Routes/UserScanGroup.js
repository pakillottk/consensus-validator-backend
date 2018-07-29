const DBQuery = require( '../Database/Queries/DBQuery' );
const UserScanGroupModel = require( '../Database/UserScanGroup' );
const ScanGroupModel = require('../Database/ScanGroup');

module.exports = require( './ModelRouter' )( UserScanGroupModel, '[user, group]', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( UserScanGroupModel );
    if( sessionId ) {
        dbQuery.join(
            ScanGroupModel.tableName,
            UserScanGroupModel.listFields(UserScanGroupModel,['group_id'],false)[0],
            ScanGroupModel.listFields(ScanGroupModel,['id'],false)[0]
        );
        dbQuery.where().addClause( ScanGroupModel.listFields(ScanGroupModel,['session_id'],false)[0], '=', sessionId );
    }

    return dbQuery;
} );