const Model = require( './Model' );

class SeatReserve extends Model {
    static get tableName() {
        return 'SeatReserves';
    }
}

module.exports = SeatReserve;