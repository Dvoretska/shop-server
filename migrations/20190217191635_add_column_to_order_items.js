
exports.up = function(knex, Promise) {
  return knex.schema.table('order_items', function(table){
    table.integer('amount').notNull();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order_items', function(table) {
    table.dropColumn('amount');
  });
};
