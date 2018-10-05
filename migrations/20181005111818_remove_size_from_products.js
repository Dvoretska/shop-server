
exports.up = function(knex, Promise) {
  return knex.schema.table('products', function(table) {
    table.dropColumn('size');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('products', function(table) {
    table.string('size');
  });
};
