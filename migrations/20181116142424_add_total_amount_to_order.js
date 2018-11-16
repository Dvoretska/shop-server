
exports.up = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.integer('total_amount').notNull();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.dropColumn('total_amount');
  });
};

