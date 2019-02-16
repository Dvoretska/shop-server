const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const { User } = require('../../accounts/models');

const Customer = db.Model.extend({
  tableName: 'customers',
  user: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const Order = db.Model.extend({
  tableName: 'orders',
  user: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const OrderItem = db.Model.extend({
  tableName: 'order_items',
  order: function() {
    return this.belongsTo(Order, 'order_id');
  }
});

const OrderItems = db.Collection.extend({
  model: OrderItem
});


module.exports = {Customer, Order, OrderItems, OrderItem};
