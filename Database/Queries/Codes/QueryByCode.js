const Code = require('../../Code');
module.exports = async ( codeValue, typesIds = [], asArray = false, arrayOfIds = false ) => {
    try {
        const codes = await Code.query()
                        .where( 'code', 'like', '%'+codeValue+'%' )
                        .andWhere('type_id','in', typesIds);
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