const Session = require('../../Session');

module.exports = async ( companyId, asArray = false, arrayOfIds = false ) => {
    try {
        const sessions = await Session.query().where( 'company_id', '=', companyId );
        if( !asArray ) {
            return sessions;
        }

        const output = [];
        sessions.forEach( session => {
            if( arrayOfIds ) {
                output.push( session.id );
            } else {
                output.push( session );
            }
        });

        return output;
    } catch( error ) {
        if( asArray ) {
            return [];
        }
        return null;
    }
}