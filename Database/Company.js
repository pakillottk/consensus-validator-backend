const Model = require( './Model' );

class Company extends Model {
    static get tableName() {
        return 'Companies';
    }
}

module.exports = Company;