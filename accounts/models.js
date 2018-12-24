const knexDb = require('../knex.js');
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);

db.plugin(securePassword);


const Role = db.Model.extend({
    tableName: 'roles',
    hasSecurePassword: true
});

const User = db.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
    role_id: function() {
        return this.belongsTo(Role, 'role_id');
    },
});

const Oauth = db.Model.extend({
    tableName: 'oauth',
    user_id: function() {
        return this.belongsTo(User, 'user_id');
    },
});



module.exports = {User, Role, Oauth};
