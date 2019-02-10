// Update with your config settings.

module.exports = {
  test: {
    client: 'pg',
    connection: 'postgres://localhost/project_db_test'
  },
  development: {
    client: 'pg',
    connection: 'postgres://localhost/project_db'
  },
  production: {
    client: 'pg',
    connection: process.env.DB_URL
  }
};

