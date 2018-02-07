const Model = require( './Model' );

class Type extends Model {
    static get tableName() {
        return 'Types';
    }
}

module.exports = Type;