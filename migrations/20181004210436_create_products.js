
exports.up = function(knex, Promise) {
  return knex.schema.createTable('products', table => {
    table.increments('id').unsigned().primary();
    table.string('brand').notNull();
    table.integer('price').notNull();
    table.text('material').notNull();
    table.integer('discount');
    table.text('description').notNull();
    table.bigInteger('category_id').unsigned().index().references('id').inTable('categories').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('products')
};
