const DBQuery = require( '../Database/Queries/DBQuery' );
const ScanTypeModel = require( '../Database/ScanType' );

module.exports = require( './ModelRouter' )( ScanTypeModel, '[group, type]', ( req ) => {
    const groupId = req.query.group;
    const dbQuery = new DBQuery( req );
    dbQuery.addClause( 'group_id', '=', groupId );

    return dbQuery;
} );