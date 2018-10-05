
exports.up = function(knex, Promise) {
  return knex.schema.createTable('categories', table => {
    table.increments('id').unsigned().primary();
    table.string('category').notNull();
  }).then(function () {
    return knex('categories').insert([
      {category: "dresses"},
      {category: "tops"},
      {category: "bottoms"},
      {category: "shoes"},
      {category: "accessories"}
    ]);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('categories')
};
