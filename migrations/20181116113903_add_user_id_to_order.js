
exports.up = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.dropColumn('user_id');
  });
};
