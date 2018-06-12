const Model = require( './Model' );

class SeatRow extends Model {
    static get tableName() {
        return 'SeatRows';
    }
}

module.exports = SeatRow;