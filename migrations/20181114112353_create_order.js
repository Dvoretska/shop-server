
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order', table => {
    table.increments('id').unsigned().primary();
    table.string('order_number').notNull();
    table.integer('quantity').notNull();
    table.string('size').notNull();
    table.timestamp('created').notNullable().defaultTo(knex.raw('now()'));
    table.bigInteger('order_person_id').unsigned().index().references('id').inTable('order_person');
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order');
};
