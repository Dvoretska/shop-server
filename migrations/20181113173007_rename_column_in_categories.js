
exports.up = function(knex, Promise) {
  return knex.schema.table('categories', function(table) {
    table.renameColumn('category', 'name')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('categories', function(table) {
    table.string('category').notNull();
  });
};
