
exports.up = function(knex, Promise) {
  return knex.schema.createTable('product_images', table => {
    table.increments('id').unsigned().primary();
    table.string('image');
    table.bigInteger('product_id').unsigned().index().references('id').inTable('products').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('product_images')
};
