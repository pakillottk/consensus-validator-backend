const DBQuery = require( '../Database/Queries/DBQuery' );
const UserScanGroupModel = require( '../Database/UserScanGroup' );
const ScanGroupModel = require('../Database/ScanGroup');

module.exports = require( './ModelRouter' )( UserScanGroupModel, '[user, group]', async ( req ) => {
    const sessionId = req.query.session;
    const dbQuery = new DBQuery( req );
    if( sessionId ) {
        const sessionGroups = await ScanGroupModel.query().select('id').where( 'session_id', '=', sessionId );
        const groupsIds = [];
        sessionGroups.forEach( group => {
            groupsIds.push( group.id );
        });
        dbQuery.addClause( 'group_id', 'in', groupsIds );

        for( let i = 0; i < dbQuery.clauses.length; i++ ) {
            if( dbQuery.clauses[ i ].field === 'company_id' ) {
                dbQuery.clauses.splice( i, 1);
            }
        }
    }

    return dbQuery;
} );