const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const accounts = require('../../accounts/models');
const { Product } = require('../models');

const OrderPerson = db.Model.extend({
  tableName: 'order_person',
  user_id: function() {
    return this.belongsTo(accounts.User, 'user_id');
  }
});


const Order = db.Model.extend({
  tableName: 'order',
  order_person_id: function() {
    return this.belongsTo(OrderPerson, 'order_person_id');
  },
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  },
});

const Orders = db.Collection.extend({
  model: Order
});


module.exports = {OrderPerson, Order, Orders};
