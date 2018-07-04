const Model =  require('objection').Model;
const Controller = require( './Controller' );
const env = require('../env');
const fs = require('fs');
const {transaction} = require('objection')

class ModelController extends Controller {
    constructor( model ) {
        super();

        this.model = model;
    }

    moveImage( img, path ) {
        return new Promise( ( resolve, reject ) => {
            img.mv( path, ( err ) => {
                if( err ) {
                    reject( err );
                }

                resolve();
            });
        });
    }

    async processImg( file, filenamePrefix = '' ) {
        if( !file ) {
            throw new Error( 'No file to process!' );
        }

        let filename = filenamePrefix + new Date().getTime() + file.name;
        filename = filename.replace( /\s/g, '-' );
        await this.moveImage( file, env.PROJECT_DIR + '/public/images/' + filename );

        return filename;
    }

    removeImage( relativePath ) {
        if( fs.existsSync( env.PROJECT_DIR + '/' + relativePath ) ) {
            fs.unlinkSync( env.PROJECT_DIR + '/' + relativePath );
        }
    }

    async storeFiles( data, files ) {
        const fields = Object.keys( files );
        for( let i = 0; i < fields.length; i++ ) {
            const field = fields[ i ];
            const filename = await this.processImg( files[ field ] )
            data[ field ] = 'public/images/' + filename;            
        }

        return data;
    }

    removeOldFields( files, oldData ) {
        Object.keys( files ).forEach( field => {            
            this.removeImage( oldData[ field ] );
        })
    }
        
    async index( including, DBQuery ) {       
        try {
            including.replace(/^\[|\]$/g,'').split(',').forEach( rel => {
                DBQuery.include( rel );
            });
            return await DBQuery.run();
        } catch( error ) {
            return error;
        }        
    }

    get( id, including ) {
        let output = this.model.query().findById( id );
        if( including ) {
            output = output.eager( including );
        }    

        return output;
    }

    async create( data, including, query, files ) {
        try {
            if( files ) {
                if( Object.keys(files) ) {
                    data = await this.storeFiles( data, files );
                }
            }            
            const created = await this.model.query().eager( including ).insert( {...data, created_at: new Date(), updated_at: new Date()} );
            return created;
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Updated the instance by Id
    async update( id, data, including, files ) {
        try {
            if( files ) {
                if( Object.keys(files) ) {
                    const oldData = await this.model.query().findById( id );
                    this.removeOldFields( files, oldData );
                    data = await this.storeFiles( data, files );
                }
            }            
            return await this.model.query().eager( including ).patchAndFetchById( id, {...data, updated_at: new Date()} );
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Deletes the instance by Id
    async delete( id, trx ) {
        try {
            const oldData = await this.model.query( trx ).findById( id );
            if( Object.keys( this.model.files ) ) {
                this.removeOldFields( this.model.files, oldData );
            }
            const deleted = await this.model.query( trx ).deleteById( id );
            if( this.model.$afterDelete ) {
                await this.model.$afterDelete( oldData );
            }
            return { deleted_at: new Date(), deleted_id: id };
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    async bulkDelete( data ) {
        let trx
        try {
            const idsArray = JSON.parse(data.ids);
            trx = await transaction.start( this.model.knex() );
            for( let i = 0; i < idsArray.length; i++ ) {
                await this.delete( idsArray[i], trx )
            }

            await trx.commit();

            return { deleted_at: new Date(), deleted_ids: idsArray.length };
        } catch( error ) {
            if( trx ) {
                await trx.rollback();
            }

            throw error;
        }
    }
}

module.exports = {
    builder: (model) => new ModelController( model ),
    class: ModelController
}