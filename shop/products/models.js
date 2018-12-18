const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const {Subcategory} = require('../categories/models');


const Product = db.Model.extend({
  tableName: 'products',
  subcategory_id: function() {
    return this.belongsTo(Subcategory, 'subcategory_id');
  }
});

const Size = db.Model.extend({
  tableName: 'sizes',
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


module.exports = {Product, Image, Images, Stock};
