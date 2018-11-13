
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('categories', function(t) {
    t.unique(['slug']);
  });
};

exports.down = function(knex, Promise) {
   return knex.schema.alterTable('categories', function(t) {
   t.string('slug');
  });
};
