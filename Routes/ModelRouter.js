const DBQuery = require( '../Database/Queries/DBQuery' );
const ModelController = require( '../Controllers/ModelController' ).builder

module.exports = ( model, including, queryBuilder, CustomController, passUser, passRes ) => {
    const Router = require( 'express' ).Router();
    const controller = CustomController ? CustomController(model) : ModelController( model );
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
            if( !req.body.user_id && passUser ) {
                req.body.user_id = user.id;
            }
            if( passRes ) {
                const data = await controller.create( user.company_id ? {...req.body, company_id: user.company_id } : req.body, including, req.query, res );
            } else {
                const data = await controller.create( user.company_id ? {...req.body, company_id: user.company_id } : req.body, including, req.query );
                res.send( data );
            }
        } catch( error ) {
            res.status( 400 ).send( error );
        }
    });

    Router.put( '/:id', async ( req, res ) => {
        try {
            const user = req.res.locals.oauth.token.user;
            if( !req.body.user_id && passUser ) {
                req.body.user_id = user.id;
            }
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