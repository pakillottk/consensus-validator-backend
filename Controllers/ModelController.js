const Model =  require('objection').Model;
const Controller = require( './Controller' );
const env = require('../env');
const fs = require('fs');

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

        let filename = filenamePrefix + file.name + new Date().getTime() ;
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
        if( including ) {
            output = output.eager( including );
        }    

        if( DBQuery ) {
            return this.applyDBQuery( output, DBQuery );
        }

        return output;
    }

    async create( data, including, query, files ) {
        try {
            if( Object.keys(files) ) {
                data = await this.storeFiles( data, files );
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
            if( Object.keys(files) ) {
                const oldData = await this.model.query().findById( id );
                this.removeOldFields( files, oldData );
                data = await this.storeFiles( data, files );
            }
            return await this.model.query().eager( including ).patchAndFetchById( id, {...data, updated_at: new Date()} );
        } catch( error ) {
            console.log( error );
            throw { code: error.code, message: error.detail };
        }
    }

    //Deletes the instance by Id
    async delete( id ) {
        try {
            if( Object.keys( this.model.files ) ) {
                const oldData = await this.model.query().findById( id );
                this.removeOldFields( this.model.files, oldData );
            }
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