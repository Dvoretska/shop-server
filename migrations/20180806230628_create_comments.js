
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comments', table => {
    table.increments('id').unsigned().primary();
    table.string('text').notNull();
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users');
    table.bigInteger('post_id').unsigned().index().references('id').inTable('posts');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comments')
};
