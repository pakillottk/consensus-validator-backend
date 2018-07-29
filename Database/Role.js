const Model = require( './Model' );

class Role extends Model {
    static get tableName() {
        return 'Roles';
    }

    static get columns() {
        return ['id','role','created_at','updated_at'];
    }
}

module.exports = Role;