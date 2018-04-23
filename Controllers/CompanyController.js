const env = require('../env');
const fs = require('fs');
const ModelController = require('./ModelController').class

class CompanyController extends ModelController {
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

    async create( data, including, query, files ) {
        try {
            if( !files ) {
                throw new Error( 'No files uploaded' );
            }
            if( !files.logo_url ) {
                throw new Error( 'No logo_url field found' );
            }

            const logoImg = files.logo_url;
            const filename = data.name + new Date().getTime();
            await this.moveImage( logoImg, env.PROJECT_DIR + '/public/images/' + filename );

            data.logo_url = 'public/images/' + filename;
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
                if( !files.logo_url ) {
                    return;
                }

                let oldCompany = await this.model.query().where( 'id', '=', id );
                if( oldCompany.length > 0 ) {
                    oldCompany = oldCompany[0];

                    const logoImg = files.logo_url;
                    const filename = (data.name ? data.name : oldCompany.name) + new Date().getTime();

                    await this.moveImage( 
                        logoImg, 
                        env.PROJECT_DIR + 
                        '/public/images/' + 
                        filename     
                    );
                    data.logo_url = 'public/images/' + filename;

                    //Remove old logo picture
                    if( oldCompany.logo_url ) {
                        fs.unlinkSync( env.PROJECT_DIR + '/' + oldCompany.logo_url );
                    }
                }
            }
            return await this.model.query().eager( including ).patchAndFetchById( id, {...data, updated_at: new Date()} );
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }

    //Deletes the instance by Id
    async delete( id ) {
        try {
            let oldCompany = await this.model.query().where( 'id', '=', id );
            if( oldCompany.length > 0 ) {
                oldCompany = oldCompany[0];
                //Remove old logo picture
                fs.unlinkSync( env.PROJECT_DIR + '/' + oldCompany.logo_url );
            }
            const deleted = await this.model.query().deleteById( id );
            return { deleted_at: new Date(), deleted_id: id };
        } catch( error ) {
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = ( model ) => new CompanyController( model );