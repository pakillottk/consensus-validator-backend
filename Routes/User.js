const UserModel = require( '../Database/User' );
module.exports = require( './ModelRouter' )( UserModel, '[role, company]' );