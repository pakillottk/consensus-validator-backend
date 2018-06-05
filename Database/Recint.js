const Model = require( './Model' );

class Recint extends Model {
    static get tableName() {
        return 'Recints';
    }
}

module.exports = Recint;