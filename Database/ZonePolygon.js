const Model = require( './Model' );

class ZonePolygon extends Model {
    static get tableName() {
        return 'ZonePolygons';
    }

    static get columns() {
        return [
            'id',
            'zone_id',
            'vertex_index',
            'x',
            'y',
            'created_at',
            'updated_at'
        ];
    }
}

module.exports = ZonePolygon;