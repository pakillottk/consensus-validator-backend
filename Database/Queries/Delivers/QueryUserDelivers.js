const Deliver = require('../../Deliver');

module.exports = async ( userId, asArray = false, arrayOfIds = false, arrayOfField ) => {
    try {
        const delivers = await Deliver.query().where( 'user_id', '=', userId );
        if( !asArray ) {
            return delivers;
        }

        const output = [];
        delivers.forEach( deliver => {
            if( arrayOfIds ) {
                output.push( deliver.id );
            } else if( arrayOfField ) {
                output.push( deliver[ arrayOfField ] );
            } else{
                output.push( deliver );
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