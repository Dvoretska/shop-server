
exports.up = function(knex, Promise) {
  return knex.schema.table('orders', function(table) {
    table.dropColumn('brand');
    table.dropColumn('category');
    table.dropColumn('subcategory');
    table.dropColumn('quantity');
    table.dropColumn('size');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('orders', function(table) {
    table.string('brand').notNull();
    table.string('category').notNull();
    table.string('subcategory').notNull();
    table.integer('quantity').notNull();
    table.string('size').notNull();
  });
};
