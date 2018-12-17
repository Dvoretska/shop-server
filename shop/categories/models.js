const knexDb = require('../../knex.js');
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);


const Category = db.Model.extend({
  tableName: 'categories',
});

const Subcategory = db.Model.extend({
  tableName: 'subcategories',
  category: function() {
    return this.belongsTo(Category, 'category_id');
  }
});


module.exports = {Category, Subcategory};
