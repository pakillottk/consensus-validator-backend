const Model = require( './Model' );

class Type extends Model {
    static get tableName() {
        return 'Types';
    }
    static get columns() {
        return ['id','type','price','ammount','session_id','created_at','updated_at']
    }
}

module.exports = Type;