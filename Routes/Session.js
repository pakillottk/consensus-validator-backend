const DBQuery = require('../Database/Queries/DBQuery');
const SessionModel = require( '../Database/Session' );
const Type = require('../Database/Type');
const Deliver = require('../Database/Deliver');

module.exports = require( './ModelRouter' )( SessionModel, '[company, recint]', async ( req ) => {
    const user = req.res.locals.oauth.token.user;
    const dbQuery = new DBQuery( SessionModel );
    
    //Show only sessions with delivered tickets
    if( [ 'seller', 'ticketoffice-manager' ].includes( user.role.role ) ) {
        const deliverSessions = new DBQuery( Deliver );
        deliverSessions.join(
            Type.tableName, 
            Deliver.listFields( Deliver,'type_id', false )[0],
            Type.listFields( Type,'id',false )[0] 
        );
        deliverSessions.join(
            SessionModel.tableName,
            Type.listFields( Type,['session_id'],false )[0],
            SessionModel.listFields(SessionModel,['id'],false)[0]
        );
        deliverSessions.setSelect( Type.listFields(Type,['session_id'],false) );
        deliverSessions.where().addClause( Deliver.listFields(Deliver, ['user_id'],false)[0], '=', user.id );
        
        const sessions = await deliverSessions.run().map( type => type.session_id);
        dbQuery.where().addClause(SessionModel.listFields(SessionModel,['id'],false)[0], 'in', sessions );
    } else if( ['admin','supervisor'].includes( user.role.role ) ) {
        //show only own sessions
        dbQuery.where().addClause(SessionModel.listFields(SessionModel,['company_id'],false)[0],'=',user.company_id);
    }

    dbQuery.addAllReqParams( 
        SessionModel.tableName,
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