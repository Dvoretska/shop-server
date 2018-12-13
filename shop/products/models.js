const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);


const Product = db.Model.extend({
  tableName: 'products',
  category_id: function() {
    return this.belongsTo(Category, 'category_id');
  }
});

const Category = db.Model.extend({
  tableName: 'categories',
});

const Size = db.Model.extend({
  tableName: 'sizes',
});

const Subcategory = db.Model.extend({
  tableName: 'subcategories',
  category_id: function() {
    return this.belongsTo(Category, 'category_id');
  }
});

const Image = db.Model.extend({
  tableName: 'product_images',
  product: function() {
    return this.belongsTo(Product, 'product_id');
  }
});

const Stock = db.Model.extend({
  tableName: 'stocks',
  product: function() {
    return this.belongsTo(Product, 'product_id');
  },
  size: function() {
    return this.belongsTo(Size, 'size_id');
  }
});

const Images = db.Collection.extend({
  model: Image
});


module.exports = {Product, Category, Subcategory, Image, Images, Stock};
