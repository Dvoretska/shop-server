
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments('id').unsigned().primary();
    table.string('email').notNull();
    table.string('password_digest').notNull();
    table.binary('image');
    table.bigInteger('role_id').unsigned().index().references('id').inTable('roles').default(1);
    table.unique(['email']);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};

