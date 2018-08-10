
exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts', table => {
    table.increments('id').unsigned().primary();
    table.string('title').notNull();
    table.string('image').notNull();
    table.text('content').notNull();
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('posts')
};
