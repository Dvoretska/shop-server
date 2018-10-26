
exports.up = function(knex, Promise) {
  return knex.schema.createTable('wishlist', table => {
    table.increments('id').unsigned().primary();
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('wishlist')
};
