const DBQuery = require( '../Database/Queries/DBQuery' );
const ScanTypeModel = require( '../Database/ScanType' );

module.exports = require( './ModelRouter' )( ScanTypeModel, '[group, type]', ( req ) => {
    const groupId = req.query.group;
    const dbQuery = new DBQuery( ScanTypeModel );
    dbQuery.where().addClause( ScanTypeModel.listFields(ScanTypeModel,['group_id'],false)[0], '=', groupId );

    return dbQuery;
} );