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
}

module.exports = Company;