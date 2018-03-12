const DBQuery = require( '../Database/Queries/DBQuery' );

module.exports = ( model, including, queryBuilder ) => {
    const Router = require( 'express' ).Router();
    const controller = require( '../Controllers/ModelController' )( model );
    queryBuilder = queryBuilder || ( async ( req ) => new DBQuery( req ) );
    including = including || '';

    Router.get( '/', async ( req, res ) => {
        const data = await controller.index( including, await queryBuilder( req ) );
        res.send( data );
    });

    Router.get( '/:id', async ( req, res ) => {
        const data = await controller.get( req.params.id, '', await queryBuilder( req ) );
        res.send( data );
    });

    Router.post( '/' , async ( req, res ) => {
        try {
            const user = req.res.locals.oauth.token.user;
            const data = await controller.create( user.company_id ? {...req.body, company_id: user.company_id } : req.body, including );
            res.send( data );
        } catch( error ) {
            res.status( 400 ).send( error );
        }
    });

    Router.put( '/:id', async ( req, res ) => {
        try {
            const data = await controller.update( req.params.id, req.body, including );
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