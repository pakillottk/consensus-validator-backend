const Model = require( './Model' );
const RecintZone = require( './RecintZone' );
const Type = require( './Type' );

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
            },
            type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Type,
                join: {
                    from: 'SeatPrices.type_id',
                    to: 'Types.id'
                }
            }
        };
    }

    static get columns() {
        return [
            'id',
            'session_id',
            'zone_id',
            'type_id',
            'numerated',
            'from_row',
            'from_seat',
            'to_row',
            'to_seat',
            'created_at',
            'updated_at'
        ];
    }
}

module.exports = SeatPrice;