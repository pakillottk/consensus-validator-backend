const Controller = require( './Controller' );

class ModelController extends Controller {
    constructor( model ) {
        super();

        this.model = model;
    }

    index() {
        return this.model.query();    
    }

    get( id ) {
        return this.model.query().findById( id );
    }

    async create( data ) {
        try {
            const created = await this.model.query().insert( data );
            return created;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Updated the instance by Id
    async update( id, data ) {
        try {
            const updated = await this.model.query().patchAndFetchById( id, data );
            return updated;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Deletes the instance by Id
    async delete( id ) {
        try {
            const deleted = await this.model.query().deleteById( id );
            return deleted;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = (model) => new ModelController( model );