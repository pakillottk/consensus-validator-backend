const Controller = require( './Controller' );

class ModelController extends Controller {
    constructor( model ) {
        super();

        this.model = model;
    }

    index( including ) {
        const output = this.model.query();
        if( including ) {
            return output.eager( including );
        }    

        return output;
    }

    get( id, including ) {
        return this.model.query().findById( id );
    }

    async create( data ) {
        try {
            const created = await this.model.query().insert( {...data, created_at: new Date(), updated_at: new Date()} );
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
            return deleted;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = (model) => new ModelController( model );