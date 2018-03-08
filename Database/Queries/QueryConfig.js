const QueryConfig = {
    userGuards: [
        {
            role_exceptions: {
                superadmin: true
            },
            entities: [ 'companies' ],
            field: 'id',
            operator: '=',
            user_field: 'company_id'
        },
        {
            role_exceptions: {
                superadmin: true
            },
            entities: [ 'sessions' ],
            field: 'company_id',
            operator: '=',
            user_field: 'company_id'
        }
    ]
}
module.exports = QueryConfig;