
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_person', table => {
    table.increments('id').unsigned().primary();
    table.string('phone').notNull();
    table.string('post_code').notNull();
    table.string('country').notNull();
    table.string('city').notNull();
    table.string('first_name').notNull();
    table.string('surname').notNull();
    table.text('comment');
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_person');
};
