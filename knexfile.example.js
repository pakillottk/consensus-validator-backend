module.exports = {
    environment: { //production, development...
      client: 'my_db_engine',
      connection: {
        database: 'my_database',
        user:     'db_user',
        password: 'db_password'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    }
};
  