const actions = require('./actions');
const validation = require('../services/validation');
const auth = require('../services/auth');


const router = require('express').Router();

router.post('/register',  
  validation.isPasswordValid,
  actions.register);

router.post('/login',
  actions.login);

router.get('/users',
  auth.isAuthenticated,
  validation.allowedRoles(['admin', 'premium']),
  actions.getUsersList);

router.post('/profile',
  auth.isAuthenticated,
  validation.isPasswordValidOrEmpty,
  validation.isImageValid,
  actions.profile);

router.post('/create',
  auth.isAuthenticated,
  validation.allowedRoles(['admin']),
  validation.isPasswordValid,
  actions.createUser);

router.delete('/delete',
  auth.isAuthenticated,
  validation.allowedRoles(['admin']),
  actions.deleteUser);

router.post('/update',
  auth.isAuthenticated,
  validation.limitedAllowedRoles(['premium']),
  validation.isPasswordValidOrEmpty,
  validation.isImageValid,
  actions.update);

module.exports = router;
