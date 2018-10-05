const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);


const Product = db.Model.extend({
  tableName: 'products',
  user_id: function() {
    return this.belongsTo(Category, 'category_id');
  }
});

const Category = db.Model.extend({
  tableName: 'categories',
});


const Image = db.Model.extend({
  tableName: 'images',
  product_id: function() {
    return this.belongsTo(Product, 'product_id');
  }
});

module.exports = {Product, Category, Image};
