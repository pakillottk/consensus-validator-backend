const Model =  require('objection').Model;
const Controller = require( './Controller' );

class ModelController extends Controller {
    constructor( model ) {
        super();

        this.model = model;
    }

    applyDBQuery( query, DBQuery ) {
        if( DBQuery ) {
            for( let i = 0; i < DBQuery.clauses.length; i++ ) {
                const clause = DBQuery.clauses[ i ];
                if( clause.operator === 'in' ) {
                    query = query.whereIn( clause.field, clause.value );
                } else if( clause.operator === 'between' ) {
                    query = query.whereBetween( clause.field, clause.value );
                } else {                   
                    if( i === 0 ) {
                        query = query.where( clause.field, clause.operator, clause.value );
                    } else {
                        if( clause.linker === 'and' ) {
                            query = query.andWhere( clause.field, clause.operator, clause.value );
                        } else {
                            query = query.orWhere( clause.field, clause.operator, clause.value );
                        }
                    }
                }
            }
        }

        return query;
    }

    index( including, DBQuery ) {       
        let output = this.model.query();
        if( including ) {
            output = output.eager( including );
        }    

        return this.applyDBQuery( output, DBQuery );
    }

    get( id, including, DBQuery ) {
        let output = this.model.query().findById( id );
        if( DBQuery ) {
            return this.applyDBQuery( output, DBQuery );
        }

        return output;
    }

    async create( data, including, query ) {
        try {
            const created = await this.model.query().eager( including ).insert( {...data, created_at: new Date(), updated_at: new Date()} );
            return created;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Updated the instance by Id
    async update( id, data, including ) {
        try {
            return await this.model.query().eager( including ).patchAndFetchById( id, {...data, updated_at: new Date()} );
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Deletes the instance by Id
    async delete( id ) {
        try {
            const deleted = await this.model.query().deleteById( id );
            return { deleted_at: new Date(), deleted_id: id };
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = {
    builder: (model) => new ModelController( model ),
    class: ModelController
}