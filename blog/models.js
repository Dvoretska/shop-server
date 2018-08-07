const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
const models = require('../accounts/models');

db.plugin(securePassword);


const Post = db.Model.extend({
  tableName: 'posts',
  hasSecurePassword: true,
  user_id: function() {
    return this.belongsTo(models.User, 'user_id');
  }
});

// const Comment = db.Model.extend({
//   tableName: 'comments',
//   hasSecurePassword: true,
//   role_id: function() {
//       return this.belongsTo(Role, 'role_id');
//   }
// });

module.exports = {User, Role};