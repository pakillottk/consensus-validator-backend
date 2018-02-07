const Model = require( './Model' );

class Role extends Model {
    static get tableName() {
        return 'Roles';
    }
}

module.exports = Role;