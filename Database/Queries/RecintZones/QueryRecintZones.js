const RecintZone = require('../../RecintZone');
module.exports = async ( recintId, asArray = false, arrayOfIds = false ) => {
    try {
        const zones = await RecintZone.query().where( 'recint_id', recintId );
        if( !asArray ) {
            return zones;
        }

        const output = [];
        zones.forEach( zone => {
            if( arrayOfIds ) {
                output.push( zone.id );
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