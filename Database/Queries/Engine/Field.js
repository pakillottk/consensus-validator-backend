class Field {
    constructor( table, column, alias=null ) {
        this.table = table;
        this.column = column;
        this.alias = alias;
    }

    formatted( withTable=true, separator='.' ) {
        return withTable ? this.table+separator+this.column : this.column;
    }
}

module.exports = Field;