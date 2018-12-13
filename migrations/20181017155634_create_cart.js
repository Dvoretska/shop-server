
exports.up = function(knex, Promise) {
  return knex.schema.createTable('cart', table => {
    table.increments('id').unsigned().primary();
    table.integer('quantity').notNull();
    table.boolean('is_ordered').default(false);
    table.bigInteger('size_id').unsigned().index().references('id').inTable('sizes').onDelete('CASCADE');
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cart')
};
