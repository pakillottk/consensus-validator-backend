class Join {
    constructor( table, field_l, field_r, type, on ) {
        this.table = table
        this.field_l = field_l
        this.field_r = field_r
        this.type = type
        this.on = on
    }
}
module.exports = Join;