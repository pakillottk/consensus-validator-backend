class DBQuery {
    constructor( req ) {
        this.clauses = [];
        const user = req.res.locals.oauth.token.user;
        if( user.role.role !== 'superadmin' ) {
            console.log( req.originalUrl );
            if( req.originalUrl.includes( 'companies' ) ) {
                this.addClause( 'id', '=', user.company_id );
            } else {
                this.addClause( 'company_id', '=', user.company_id );
            }
        }
    }

    addClause( field, operator, value, linker = 'and' ) {
        this.clauses.push({
            field,
            operator,
            value,
            linker
        });
    }
}

module.exports = DBQuery;