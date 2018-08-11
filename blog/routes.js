const actions = require('./actions');
const validation = require('../services/validation');
const auth = require('../services/auth');


const router = require('express').Router();

router.post('/create-post',
  auth.isAuthenticated,
  validation.allowedRoles(['user', 'premium']),
  validation.isImageValid,
  actions.createPost);

router.get('/posts',
  auth.isAuthenticated,
  actions.getPosts);

router.get('/post',
  auth.isAuthenticated,
  actions.getPost);

router.post('/comment',
  auth.isAuthenticated,
  actions.createComment);


module.exports = router;