const env = require('../env');
const fs = require('fs');
const ModelController = require('./ModelController').class

class CompanyController extends ModelController {   
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