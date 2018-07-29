const Model = require( './Model' );

class SeatRow extends Model {
    static get tableName() {
        return 'SeatRows';
    }

    static get columns() {
        return [
            'id',
            'zone_id',
            'row_index',
            'numeration',
            'firstSeat',
            'type',
            'rowOffset',
            'rowDirection',
            'orientation',
            'seats',
            'seatSize',
            'seatSpacing',
            'startMargin',
            'p0x',
            'p0y',
            'p1x',
            'p1y',
            'p2x',
            'p2y',
            'created_at',
            'updated_at'
        ];
    }
}

module.exports = SeatRow;