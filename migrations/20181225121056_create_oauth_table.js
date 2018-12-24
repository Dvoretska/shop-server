
exports.up = function(knex, Promise) {
   return knex.schema.createTable('oauth', table => {
     table.increments('id').unsigned().primary();
     table.string('profile_id').notNull();
     table.bigInteger('user_id').unsigned().index().references('id').inTable('users').onDelete('CASCADE');
     table.unique(['profile_id']);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('oauth');
};
