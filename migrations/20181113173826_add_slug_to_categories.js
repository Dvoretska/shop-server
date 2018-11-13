const slugify = require('slugify');

exports.up = function(knex, Promise) {
  return knex.schema.table('categories', table => {
    table.string('slug').notNull();
  }).then(() => this.select('name')).then((rows) => this.insert(slugify(rows)))
};

exports.down = function(knex, Promise) {
  return knex.schema.table('categories', function(t) {
    t.dropColumn('slug');
  });
};
