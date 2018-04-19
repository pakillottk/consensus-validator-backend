const DBQuery = require('../Database/Queries/DBQuery');
const SessionModel = require( '../Database/Session' );

module.exports = require( './ModelRouter' )( SessionModel, '', async ( req ) => {
    const dbQuery = new DBQuery( req );
    dbQuery.addAllReqParams( 
        req.query, 
        { to_date: true }, 
        { name: true, recint: true, location: true },
        {
            from_date: {
                field: 'date',
                min: req.query.from_date,
                max: req.query.to_date || new Date()
            }
        }  
    );

    return dbQuery;    
}, null, false, false, true );