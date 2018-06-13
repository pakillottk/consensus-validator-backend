const Model = require( './Model' );
const RecintZone = require( './RecintZone' );

class SeatPrice extends Model {
    static get tableName() {
        return 'SeatPrices';
    }

    static get relationMappings() {
        return {
            zone: {
                relation: Model.BelongsToOneRelation,
                modelClass: RecintZone,
                join: {
                    from: 'SeatPrices.zone_id',
                    to: 'RecintZones.id'
                }
            }
        };
    }
}

module.exports = SeatPrice;