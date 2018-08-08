const app = module.exports = require('express')();
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);
const services = require('./services');
const actions = require('./actions');
const sharedServices = require('../shared/shared-services');


const router = require('express').Router();

router.post('/register', services.checkIfPasswordValid, actions.register);

router.post('/login', actions.login);

router.get('/users', sharedServices.isAuthenticated, services.allowedRoles(['admin', 'premium']), actions.getUsersList);

router.post('/profile', sharedServices.isAuthenticated, services.checkIfImageValid, actions.profile);

router.post('/create', sharedServices.isAuthenticated, services.allowedRoles(['admin']), actions.createUser);

router.delete('/delete', sharedServices.isAuthenticated, services.allowedRoles(['admin']), actions.deleteUser);

router.post('/update', sharedServices.isAuthenticated, services.checkIfImageValid, services.limitedAllowedRoles(['premium']), actions.update);

module.exports = router;