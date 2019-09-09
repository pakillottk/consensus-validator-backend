const Select = require('./Select');
const Join = require('./Join');
const Where = require('./Where');
const Orders = require('./Orders');
const Field = require('./Field');
const Aggregation = require('./Aggregation');
const Aggregators = require('./Aggregators')

class Query {
    //table, base table of the query
    //owner, who is making the query
    constructor( table, owner ) {
        this.table = table;
        this.owner = owner;

        this.select = new Select();
        this.includes = [];
        this.joins = [];
        this.aggregate = [];
        this.wheres = [];
        this.order = [];
        this.groups = [];
    }   

    include( relation ) {
        this.includes.push( relation );
    }
    
    setSelect( fields ) {
        this.select.fields = [...this.select.fields, ...fields];
    }
    
    addAggregation( field, aggregator ) {
        if( Aggregators[aggregator] ) {
            this.aggregate.push(new Aggregation(field, Aggregators[aggregator]));
        }
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

    groupBy( field ) {
        this.groups.push( field );
    }

    setGroupBy( fields ) {
        this.groups = [...this.groups, ...fields];
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

    /*
        Given a join config (table, fieldL and fieldR) and a list of fields
        of the joined table add the where clauses according to the specified fields
        and user's request query
    */ 
    addAllReqParamsOfRelation( joinConfig, fieldsToQuery, likeFields, queryParams )
    {
        //if there's no fields of wanted table, avoid the join
        let foundFields = false;
        
        const where = this.where();

        //add the clauses to the query
        fieldsToQuery.forEach( field => {
            const value = queryParams[ field ];
            if( value !== undefined )
            {
                foundFields = true;
                //add a like or a simple comparison
                if( likeFields[field] )
                {
                    where.addClause( new Field( joinConfig.table, field ), 'lk', '%' + value + '%' );
                }
                else
                {
                    where.addClause( new Field(joinConfig.table, field), '=', value );
                }
            }
        });

        //make the join
        if( foundFields )
        {
            this.join(
                joinConfig.table,
                joinConfig.fieldL,
                joinConfig.fieldR
            );
        }
    }

    //must be implemented in drivers (subclasses)
    run() {
        throw new Error('Not implemented');
    }
}
module.exports = Query;