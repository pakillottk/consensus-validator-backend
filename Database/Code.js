const Model = require( './Model' );

class Code extends Model {
    static get tableName() {
        return 'Codes';
    }
}

module.exports = Code;