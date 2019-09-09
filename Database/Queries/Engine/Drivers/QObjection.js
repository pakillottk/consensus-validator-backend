const Query = require('../Query');

class QObjection extends Query {
    setEagerIncludes(including)
    {
        including.replace(/^\[|\]$/g,'').split(',').forEach( rel => {
            this.include( rel );
        });
    }

    applyClause( q, clause, linker, first=false ) {
        if( first ) {
            switch( clause.op ) {
                case 'in': {
                    q = q.whereIn( clause.field.formatted(), clause.value  );
                    break;
                }
                case 'btw': {
                    q = q.whereBetween( clause.field.formatted(), clause.value );
                    break;
                }
                case 'is': {
                    q = q.whereNull( clause.field.formatted() );
                    break;
                }
                case 'is not': {
                    q = q.whereNotNull( clause.field.formatted() );
                    break;
                }
                default: {
                    q = q.where( clause.field.formatted(), clause.op, clause.value );
                }
            }
        } else {
            if( linker.match(/and/i) ) {
                switch( clause.op ) {
                    case 'in': {
                        q = q.whereIn( clause.field.formatted(), clause.value  );
                        break;
                    }
                    case 'btw': {
                        q = q.whereBetween( clause.field.formatted(), clause.value );
                        break;
                    }
                    case 'is': {
                        q = q.whereNull( clause.field.formatted() );
                        break;
                    }
                    case 'is not': {
                        q = q.whereNotNull( clause.field.formatted() );
                        break;
                    }
                    default: {
                        q = q.andWhere( clause.field.formatted(), clause.op, clause.value );
                    }
                }
            } else if( linker.match(/or/i) ) {
                switch( clause.op ) {
                    case 'in': {
                        q = q.orWhereIn( clause.field.formatted(), clause.value  );
                        break;
                    }
                    case 'btw': {
                        q = q.orWhereBetween( clause.field.formatted(), clause.value );
                        break;
                    }
                    case 'is': {
                        q = q.orWhereNull( clause.field.formatted() );
                        break;
                    }
                    case 'is not': {
                        q = q.orWhereNotNull( clause.field.formatted() );
                        break;
                    }
                    default: {
                        q = q.orWhere( clause.field.formatted(), clause.op, clause.value );
                    }
                }
            }
        }
    
        return q;
    }
    
    passClauses( builder, w ) {
        w.clauses.forEach( (clause,i) => {
            builder = this.applyClause( builder, clause.clause, clause.linker, i===0 )
        })
    }

    run() {
        let query = this.table.query();
        //run eager loads
        query = query.eager( '[' + this.includes.join(',') + ']' );
        //run aggregations
        this.aggregate.forEach( aggregation => {
            query = query[aggregation.aggregator]( aggregation.field.formatted() );
        })
        //run selects
        query = query.select( this.select.formatFields() );
        //run joins
        this.joins.forEach( j => {
            switch( j.type ) {
                case 'inner': {
                    query = query.innerJoin( j.table, j.field_l.formatted(), j.field_r.formatted() );
                    break;
                }
                case 'left': {
                    query = query.leftJoin( j.table, j.field_l.formatted(), j.field_r.formatted() );
                    break;
                }
                case 'right': {
                    query = query.rightJoin( j.table, j.field_l.formatted(), j.field_r.formatted() );
                    break;
                }
            }
            
        });
        //run wheres
        this.wheres.forEach( (w,i) => {
            if( i>0 ) {
                if( w.linker.match(/and/i) ) {
                    query.andWhere( builder => {
                        this.passClauses( builder, w )
                    })
                } else if( w.linker.match(/or/i) ) {
                    query.orWhere( builder => {
                        this.passClauses( builder, w )
                    })
                }
            } else {
                //first where
                query.where( builder => {
                    this.passClauses( builder, w )
                })
            }
        })
        //run groupBy
        this.groups.forEach( field => {
            query = query.groupBy( field.formatted() );
        })
        //run orderBy
        this.order.forEach( orderCfg => {
            query = query.orderBy( orderCfg.field.formatted(), orderCfg.direction )
        })

        return query
    }
}
module.exports = QObjection;