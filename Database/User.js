const Password = require( 'objection-password' );
const Model = require( './Model' );

class User extends Password()( Model ) {
    static get tableName() {
        return 'Users';
    }
}

module.exports = User;