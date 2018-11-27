// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite'
  },
  development: {
    client: 'pg',
    connection: 'postgres://localhost/project_db'
  }
};

