
exports.up = function(knex, Promise) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('category_id');
    table.bigInteger('subcategory_id').unsigned().index().references('id').inTable('subcategories').onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('products', function(table) {
    table.bigInteger('category_id').unsigned().index().references('id').inTable('categories').onDelete('CASCADE');
    table.dropColumn('subcategory_id');
  });
};
