const Model = require( './Model' );

class Recint extends Model {
    static get tableName() {
        return 'Recints';
    }

    static get columns() {
        return [
            'id',
            'recint',
            'location',
            'address',
            'recint_plane',
            'created_at',
            'updated_at'
        ];
    }
}

module.exports = Recint;