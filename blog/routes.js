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
  actions.getPosts);

router.get('/post',
  actions.getPost);

router.post('/comment',
  auth.isAuthenticated,
  validation.allowedRolesHandleBlog(['admin', 'premium']),
  actions.createComment);

router.post('/update-comment',
  auth.isAuthenticated,
  validation.allowedRolesHandleComments(['admin', 'premium']),
  actions.updateComment);

router.delete('/delete-comment',
  auth.isAuthenticated,
  validation.allowedRolesHandleComments(['admin', 'premium']),
  actions.deleteComment);

router.delete('/delete-post',
  auth.isAuthenticated,
  validation.allowedRolesHandleBlog(['admin']),
  actions.deletePost);

router.post('/update-post',
  auth.isAuthenticated,
  validation.allowedRolesHandleBlog(['admin']),
  validation.isImageValid,
  actions.updatePost);

module.exports = router;
