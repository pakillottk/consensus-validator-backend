const Code = require('../../Code');
module.exports = async ( typeIds, asArray = false, arrayOfIds = false ) => {
    try {
        const codes = await Code.query().whereIn( 'type_id', typeIds );
        if( !asArray ) {
            return codes;
        }

        const output = [];
        codes.forEach( code => {
            if( arrayOfIds ) {
                output.push( code.id );
            } else {
                output.push( code );
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