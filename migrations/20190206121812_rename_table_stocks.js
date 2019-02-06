
exports.up = function(knex, Promise) {
  return knex.schema.renameTable('stocks', 'stock');
};

exports.down = function(knex, Promise) {
  return knex.schema.renameTable('stock', 'stocks')
};
