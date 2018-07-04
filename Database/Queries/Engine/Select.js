class Select {
    constructor( fields ){
        this.fields = fields||[]
    }

    formatFields( separator='.' ) {
        return this.fields.map( f => f.formatted( true, separator ) );
    }
}
module.exports = Select;