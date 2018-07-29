
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('roles', table => {
    table.increments('id').unsigned().primary();
    table.string('role').notNull();
  }).then(function () {
      return knex('roles').insert([
        {role: "user"},
        {role: "premium"},
        {role: "admin"}
      ]);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('roles')
  ])
};