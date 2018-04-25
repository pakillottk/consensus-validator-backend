const Type = require('../../Type');
module.exports = async ( sessionIds, asArray = false, arrayOfIds = false ) => {
    try {
        const types = await Type.query().whereIn( 'session_id', sessionIds );
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