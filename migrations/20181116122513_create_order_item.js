
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_item', table => {
    table.increments('id').unsigned().primary();
    table.integer('quantity').notNull();
    table.string('size').notNull();
    table.integer('amount').notNull();
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_item');
};
