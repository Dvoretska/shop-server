const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const {User} = require('../../accounts/models');
const {Product} = require('../products/models');

const Wishlist = db.Model.extend({
  tableName: 'wishlist',
  user_id: function() {
    return this.belongsTo(User, 'user_id');
  },
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  },
});

module.exports = {Wishlist};
