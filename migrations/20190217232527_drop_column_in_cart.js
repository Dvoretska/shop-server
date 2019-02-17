
exports.up = function(knex, Promise) {
  return knex.schema.table('cart', function(table) {
    table.dropColumn('is_ordered');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('cart', function(table) {
    table.boolean('is_ordered').default(false);
  });
};