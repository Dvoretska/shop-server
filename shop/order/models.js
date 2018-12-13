const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const { User } = require('../../accounts/models');

const OrderPerson = db.Model.extend({
  tableName: 'customers',
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const Order = db.Model.extend({
  tableName: 'orders',
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  }
});

const Orders = db.Collection.extend({
  model: Order
});


module.exports = {OrderPerson, Order, Orders};
