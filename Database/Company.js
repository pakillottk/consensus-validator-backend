const Model = require( './Model' );

class Company extends Model {
    static get tableName() {
        return 'Companies';
    }

    static get files() {
        return {
            logo_url: true
        }
    }

    static get columns() {
        return [ 'id','nif','name','address','logo_url','phone','email', 'created_at', 'updated_at'];
    }
}

module.exports = Company;