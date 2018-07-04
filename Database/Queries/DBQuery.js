const env = require('../../env');
const DBQuery = require('./Engine/Drivers/DriverRegistry')[env.QUERY_DRIVER];
module.exports = DBQuery;

//const QueryConfig = require( './QueryConfig' );
/*
class DBQuery {
    constructor( req ) {
        this.clauses = [];
        const user = req.res.locals.oauth.token.user;
        
        this.applyUserGuards( user, req, QueryConfig.userGuards );
    }

    checkEntitiesInUrl( url, entities ) {
        for( let i = 0; i < entities.length; i++ ) {
            if( url.includes( entities[ i ] ) ) {
                return true;
            }
        }

        return false;
    }

    applyUserGuards( user, req, guards ) {
        const role = user.role.role;
        guards.forEach( guard => {
            if( !guard.role_exceptions[ role ] ) {
                if( this.checkEntitiesInUrl( req.originalUrl, guard.entities ) ) {
                    this.addClause( guard.field, guard.operator, user[ guard.user_field ] )
                }
            }
        });
    }

    addClause( field, operator, value, linker = 'and' ) {
        this.clauses.push({
            field,
            operator,
            value,
            linker
        });
    }

    addAllReqParams( params, exclude, likeFields, between ) {
        likeFields = likeFields || {};
        between = between || {};
        Object.keys( params ).forEach( param => {
            if( exclude[ param ] ) {
                return;
            }
            const value = params[ param ];
            if( likeFields[ param ] ) {
                this.addClause( param, 'like', '%' + value + '%' );
            } else if( between[ param ] ) {
                this.addClause( 
                    between[ param ].field, 
                    'between', 
                    [ 
                        between[ param ].min, 
                        between[ param ].max 
                    ]
                );
            } else {
                this.addClause( param, '=', value );
            }
        });
    }
}

module.exports = DBQuery;*/