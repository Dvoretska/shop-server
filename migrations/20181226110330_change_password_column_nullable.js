
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_digest').nullable().alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_digest').notNullable().alter();
  });
};
