const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const db = bookshelf(knexDb);
const accounts = require('../accounts/models');


const Post = db.Model.extend({
    tableName: 'posts',
    user_id: function() {
        return this.belongsTo(accounts.User, 'user_id');
    }
});
const Comment = db.Model.extend({
    tableName: 'comments',
    user_id: function() {
        return this.belongsTo(accounts.User, 'user_id');
    },
    post_id: function() {
        return this.belongsTo(Post, 'post_id');
    },
});

module.exports = {Post, Comment};