const actions = require('./actions');
const validation = require('../services/validation');
const auth = require('../services/auth');


const router = require('express').Router();

router.post('/create-product',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.createProduct);

router.get('/categories',
    actions.getCategories);



module.exports = router;
