
exports.up = function(knex, Promise) {
  return knex.schema.createTable('sizes', table => {
    table.increments('id').unsigned().primary();
    table.string('name').notNull();
  }).then(function () {
    return knex('sizes').insert([
      {name: '2'},
      {name: '4'},
      {name: '6'},
      {name: '8'},
      {name: '10'},
      {name: '12'},
      {name: '14'},
      {name: '16'},
      {name: '18'},
      {name: '20'},
      {name: '22'},
      {name: '24'},
      {name: '3XS'},
      {name: 'XXS'},
      {name: 'XS'},
      {name: 'S'},
      {name: 'M'},
      {name: 'L'},
      {name: 'XL'},
      {name: 'XXL'},
      {name: '3XL'},
      {name: '28'},
      {name: '30'},
      {name: '32'},
      {name: '34'},
      {name: '36'},
      {name: '38'},
      {name: '40'},
      {name: '42'},
      {name: '44'},
      {name: '46'},
      {name: '48'},
      {name: '50'},
      {name: '52'},
      {name: '54'},
      {name: '56'},
      {name: '58'},
      {name: '60'},
      {name: '62'}
    ]);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('sizes')
};











