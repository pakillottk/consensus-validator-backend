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
        try {
            const data = await controller.create( req.body );
            res.send( data );
        } catch( error ) {
            res.status( 400 ).send( error );
        }
    });

    Router.put( '/:id', async ( req, res ) => {
        try {
            const data = await controller.update( req.params.id, req.body );
            res.send( data );
        } catch( error ) {
            res.status( 400 ).send( error );
        }
    });

    Router.delete( '/:id', async( req, res ) => {
        try {
            const deleted = await controller.delete( req.params.id );
            res.send( deleted );
        } catch( error ) {
            res.status( 400 ).send( error );
        }
    });

    return Router;
}