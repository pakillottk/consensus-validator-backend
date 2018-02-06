const Model = require( './Model' );

class Session extends Model {
    static get tableName() {
        return 'Sessions';
    }
}

module.exports = Session;