
exports.up = function(knex, Promise) {
  return knex.schema.createTable('stocks', table => {
    table.increments('id').unsigned().primary();
    table.integer('quantity');
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products').onDelete('CASCADE');
    table.bigInteger('size_id').unsigned().index().references('id').inTable('sizes').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('stocks')
};
