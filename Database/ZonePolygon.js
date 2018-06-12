const Model = require( './Model' );

class ZonePolygon extends Model {
    static get tableName() {
        return 'ZonePolygons';
    }
}

module.exports = ZonePolygon;