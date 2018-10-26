const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const accounts = require('../accounts/models');


const Product = db.Model.extend({
  tableName: 'products',
  category_id: function() {
    return this.belongsTo(Category, 'category_id');
  }
});

const Category = db.Model.extend({
  tableName: 'categories',
});

const Image = db.Model.extend({
  tableName: 'images',
  product: function() {
    return this.belongsTo(Product, 'product_id');
  }
});

const Images = db.Collection.extend({
  model: Image
});

const Cart = db.Model.extend({
  tableName: 'cart',
  user_id: function() {
    return this.belongsTo(accounts.User, 'user_id');
  },
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  },
});

const Wishlist = db.Model.extend({
  tableName: 'wishlist',
  user_id: function() {
    return this.belongsTo(accounts.User, 'user_id');
  },
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  },
});

module.exports = {Product, Category, Image, Images, Cart, Wishlist};
