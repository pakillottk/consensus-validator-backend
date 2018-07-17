const Entities = require('./Entities')
const ScopeMaker = require('./Scopes')

const addScopes = ( validEntities, read, write, remove ) => {
    return [].concat.apply(
        [],
        Entities
        .slice()
        .filter( e => validEntities.includes(e) )
        .map( e => ScopeMaker( e, read, write, remove ) )
    )    
}

let adminScopes = [].concat.apply( 
    [], 
    Entities
    .slice()
    .filter(e => !['Company','Role','User', 'Recint','RecintZone','ZonePolygon'].includes(e) )
    .map( e => ScopeMaker( e, true, true, true ) ) 
);
adminScopes = adminScopes.concat( 
    addScopes( 
        ['Company','Role','User','Recint','RecintZone','ZonePolygon'], true, false, false 
    ) 
);

let supervisorScopes = [].concat.apply( 
    [], 
    Entities
    .filter(e => !['Code','Company','Role','User','Recint','RecintZone','ZonePolygon','SeatRow','Session'].includes(e) )
    .map( e => ScopeMaker( e, true, true, true ) ) 
);
supervisorScopes = supervisorScopes.concat( 
    addScopes(
        ['Code','Company','Role','User','Recint','RecintZone','ZonePolygon','SeatRow'], true, false, false
    )
);
supervisorScopes = supervisorScopes.concat( ScopeMaker( 'Session', true, true, false ) );

let scannerScopes = [].concat.apply(
    [], 
    Entities
    .slice()
    .filter(e => ['Company','Session','Type','ScanGroup','ScanType','UserScanGroup'].includes(e) )
    .map( e => ScopeMaker( e, true, false, false ) ) 
);
scannerScopes = scannerScopes.concat(
    addScopes(
        ['Code','LogEntry'], true, true, false
    )
);

let sellerScopes = addScopes(
    [
        'Comission',
        'Company',
        'Deliver',
        'Recint',
        'RecintZone',
        'SeatPrice',
        'SeatRow',
        'Session',
        'Type',
        'ZonePolygon',
        'User'
    ], true, false, false
);
sellerScopes = sellerScopes.concat(
    addScopes(
        ['LogEntry','Payment','Sales'], true, true, false
    )
);
sellerScopes = sellerScopes.concat(
    addScopes(
        ['SeatReserve'], true, true, true
    )
);

module.exports = {
    superadmin: [].concat.apply( [], Entities.map( e => ScopeMaker( e, true, true, true ) ) ),
    admin: adminScopes,
    supervisor: supervisorScopes,
    scanner: scannerScopes,
    seller: sellerScopes,
    'ticketoffice-manager': sellerScopes
}