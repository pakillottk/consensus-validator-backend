class Orders {
    constructor( field, direction ) {
        this.field = field;
        this.direction = direction.match(/asc|desc/i);
    }
}
module.exports = Orders;