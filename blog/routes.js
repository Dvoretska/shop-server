const app = module.exports = require('express')();
const passport = require('passport');
const parser = require('body-parser');
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);
const jwt = require('jsonwebtoken');
const services = require('../blog/services');
const sharedServices = require('../shared/shared-services')
const bcrypt = require('bcrypt');
const fs = require('fs');
const actions = require('./actions');


const router = require('express').Router();

router.post('/create-post', sharedServices.isAuthenticated, sharedServices.allowedRoles(['user', 'premium']), sharedServices.checkIfImageValid, actions.createPost);

// router.post('/register', services.checkIfPasswordValid, actions.register);

// router.post('/login', actions.login);

// router.get('/users', services.isAuthenticated, services.allowedRoles(['admin', 'premium']), actions.getUsersList);

// router.post('/profile', services.isAuthenticated, services.checkIfImageValid, actions.profile);

// router.post('/create', services.isAuthenticated, services.allowedRoles(['admin']), actions.createUser);

// router.delete('/delete', services.isAuthenticated, services.allowedRoles(['admin']), actions.deleteUser);

// router.post('/update', services.isAuthenticated, services.checkIfImageValid, services.limitedAllowedRoles(['premium']), actions.update);

module.exports = router;