
exports.up = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.bigInteger('order_item_id').unsigned().index().references('id').inTable('order_item');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.dropColumn('order_item_id');
  });
};
