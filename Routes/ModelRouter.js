module.exports = ( model ) => {
    const Router = require( 'express' ).Router();
    const controller = require( '../Controllers/ModelController' )( model );
    
    Router.get( '/', async ( req, res ) => {
        const data = await controller.index();
        res.send( data );
    });

    Router.get( '/:id', async ( req, res ) => {
        const data = await controller.get( req.params.id );
        res.send( data );
    });

    Router.post( '/' , async ( req, res ) => {
        const data = await controller.create( req.body );
        res.send( data );
    });

    Router.put( '/:id', async ( req, res ) => {
        const data = await controller.update( req.params.id, req.body );
        res.send( data );
    });

    Router.delete( '/:id', async( req, res ) => {
        const deleted = await controller.delete( req.params.id );
        res.send( deleted );
    });

    return Router;
}