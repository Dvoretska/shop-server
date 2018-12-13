
exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', table => {
    table.increments('id').unsigned().primary();
    table.string('order_number').notNull();
    table.timestamp('created').notNullable().defaultTo(knex.raw('now()'));
    table.string('brand').notNull();
    table.string('category').notNull();
    table.string('subcategory').notNull();
    table.integer('quantity').notNull();
    table.string('size').notNull();
    table.string('phone').notNull();
    table.string('post_code').notNull();
    table.string('country').notNull();
    table.string('city').notNull();
    table.string('first_name').notNull();
    table.string('surname').notNull();
    table.text('comment');
    table.integer('total_amount').notNull();
    table.bigInteger('user_id').unsigned().index().references('id').inTable('users');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('orders');
};
