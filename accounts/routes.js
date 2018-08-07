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
const models = require('./models');
const services = require('./services');
const bcrypt = require('bcrypt');
const fs = require('fs');
const actions = require('./actions');


const router = require('express').Router();

router.post('/register', services.checkIfPasswordValid, actions.register);

router.post('/login', actions.login);

router.get('/users', passport.authenticate('jwt', {session: false}), services.allowedRoles(['admin', 'premium']), actions.getUsersList);

router.post('/profile', passport.authenticate('jwt', {session: false}), services.checkIfImageValid, actions.profile);

router.post('/create', passport.authenticate('jwt', {session: false}), services.allowedRoles(['admin']), actions.createUser);

router.delete('/delete', passport.authenticate('jwt', {session: false}), services.allowedRoles(['admin']), actions.deleteUser);

router.post('/update', passport.authenticate('jwt', {session: false}), services.checkIfImageValid, services.limitedAllowedRoles(['premium']), actions.update);

module.exports = router;