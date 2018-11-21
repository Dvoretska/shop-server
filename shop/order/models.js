const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const { Product } = require('../products/models');
const { User } = require('../../accounts/models');

const OrderPerson = db.Model.extend({
  tableName: 'order_person',
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const OrderItem = db.Model.extend({
  tableName: 'order_item',
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  }
});

const OrderItems = db.Collection.extend({
  model: OrderItem
});


const Order = db.Model.extend({
  tableName: 'order',
  order_person_id: function() {
    return this.belongsTo(OrderPerson, 'order_person_id');
  },
  order_item_id: function() {
    return this.belongsTo(OrderItem, 'order_item_id');
  },
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const Orders = db.Collection.extend({
  model: Order
});


module.exports = {OrderPerson, Order, Orders, OrderItem, OrderItems};
