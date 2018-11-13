const slugify = require('slugify');

exports.up = function(knex, Promise) {
  return knex.schema.table('categories', function(t){
    t.string('slug');
  }).then(() => {
    return knex('categories').select('name')
  }).then((rows) => {
    let promises = [];
    for (let row of rows) {
      let promise = knex('categories').update('slug', slugify(row.name)).where('name', row.name);
      promises.push(promise)
    }
    Promise.all(promises);
  });
};


exports.down = function(knex, Promise) {
  return knex.schema.table('categories', function(t) {
    t.dropColumn('slug');
  });
};
