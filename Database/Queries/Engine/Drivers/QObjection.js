const Query = require('../Query');

class QObjection extends Query {
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
        query = query.eager( '[' + this.includes.join(',') + ']' );
        query = query.select( this.select.formatFields() );
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
        this.order.forEach( orderCfg => {
            query = query.orderBy( orderCfg.field.formatted(), orderCfg.direction )
        })

        return query
    }
}
module.exports = QObjection;