// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite',
    config: console.log('sqlite')
  },
  development: {
    client: 'pg',
    connection: 'postgres://localhost/project_db',
    config: console.log('POSTGRES')
  }
};

