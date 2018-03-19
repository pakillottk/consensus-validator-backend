const DBQuery = require( '../Database/Queries/DBQuery' );
const UserModel = require( '../Database/User' );

module.exports = require( './ModelRouter' )( UserModel, '[role, company]', null, null, false, false, true );