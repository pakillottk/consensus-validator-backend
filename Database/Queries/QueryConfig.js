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
        },
        {
            role_exceptions: {
                superadmin: true
            },
            entities: [ 'users' ],
            field: 'company_id',
            operator: '=',
            user_field: 'company_id'
        },
        {
            role_exceptions: {
                superadmin: true,
                admin: true,
                supervisor: true
            },
            entities: ['users'],
            field: 'id',
            operator: '=',
            user_field: 'id'
        },
        {
            role_exceptions: {
                superadmin: true,
                admin: true,
                supervisor: true
            },
            entities: [ 'deliveries', 'sales' ],
            field: 'user_id',
            operator: '=',
            user_field: 'id'
        }
    ]
}
module.exports = QueryConfig;