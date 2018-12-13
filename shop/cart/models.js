const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const {User} = require('../../accounts/models');
const {Product} = require('../products/models');
const {Size} = require('../products/models');

const Cart = db.Model.extend({
  tableName: 'cart',
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  },
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  },
  size_id: function() {
    return this.belongsTo(Size, 'size_id');
  },
});


module.exports = {Cart};
