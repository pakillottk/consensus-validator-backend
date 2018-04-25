const Type = require('../../Type');
module.exports = async ( sessionId, asArray = false, arrayOfIds = false ) => {
    try {
        const types = await Type.query().where( 'session_id', '=', sessionId );
        if( !asArray ) {
            return types;
        }

        const output = [];
        types.forEach( type => {
            if( arrayOfIds ) {
                output.push( type.id );
            } else {
                output.push( type );
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