const environment = process.env.NODE_ENV || 'development';
console.log(process.env.NODE_ENV)
const config = require('./knexfile.js')[environment];

module.exports = require('knex')(config);
