
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_items', table => {
    table.increments('id').unsigned().primary();
    table.string('brand').notNull();
    table.string('category').notNull();
    table.string('subcategory').notNull();
    table.integer('quantity').notNull();
    table.string('size').notNull();
    table.bigInteger('order_id').unsigned().index().references('id').inTable('orders');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_items');
};