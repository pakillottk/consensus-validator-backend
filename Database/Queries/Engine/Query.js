const Select = require('./Select');
const Join = require('./Join');
const Where = require('./Where');
const Orders = require('./Orders');
const Field = require('./Field');

class Query {
    //table, base table of the query
    //owner, who is making the query
    constructor( table, owner ) {
        this.table = table;
        this.owner = owner;

        this.select = new Select();
        this.includes = [];
        this.joins = [];
        this.wheres = [];
        this.order = [];
    }   

    include( relation ) {
        this.includes.push( relation );
    }
    
    setSelect( fields ) {
        this.select.fields = [...this.select.fields, ...fields];
    }

    join( table, fieldL, fieldR, type='inner' ) {
        this.joins.push( new Join( table, fieldL, fieldR, (type.match(/inner|left|right/i)||[null])[0] ) ); 
    }
    
    where( linker='and' ) {
        const w = new Where([], (linker.match(/and|or/i)||[null])[0]);
        this.wheres.push(w);
        return w;
    }

    orderBy( field, direction ) {
        this.order.push( new Orders( field, direction ) );
    }

    addAllReqParams( table, params, exclude, likeFields, between ) {
        likeFields = likeFields || {};
        between = between || {};
        const where = this.where();
        Object.keys( params ).forEach( param => {
            if( exclude[ param ] ) {
                return;
            }
            const value = params[ param ];
            if( likeFields[ param ] ) {
                where.addClause( new Field( table, param ), 'lk', '%' + value + '%' );
            } else if( between[ param ] ) {
                where.addClause( 
                    new Field( table, between[param].field ), 
                    'btw', 
                    [ 
                        between[ param ].min, 
                        between[ param ].max 
                    ]
                );
            } else {
                where.addClause( new Field(table, param), '=', value );
            }
        });
    }

    //must be implemented in drivers (subclasses)
    run() {
        throw new Error('Not implemented');
    }
}
module.exports = Query;