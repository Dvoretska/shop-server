
exports.up = function(knex, Promise) {
  return knex.schema.createTable('subcategories', table => {
    table.increments('id').unsigned().primary();
    table.string('name').notNull();
    table.string('slug');
    table.unique(['slug']);
    table.bigInteger('category_id').unsigned().index().references('id').inTable('categories').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('subcategories')
};
