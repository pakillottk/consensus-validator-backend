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

    create( data ) {
        return this.model.query().insert( data );
    }

    //Updated the instance by Id
    update( id, data ) {
        return this.model.query().patchAndFetchById( id, data );
    }

    //Deletes the instance by Id
    delete( id ) {
        return this.model.query().deleteById( id );
    }
}

module.exports = (model) => new ModelController( model );