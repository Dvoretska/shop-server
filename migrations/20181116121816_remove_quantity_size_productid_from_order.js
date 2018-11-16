
exports.up = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.dropColumn('quantity');
    table.dropColumn('size');
    table.dropColumn('product_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('order', function(table) {
    table.integer('quantity').notNull();
    table.string('size').notNull();
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products');
  });
};
