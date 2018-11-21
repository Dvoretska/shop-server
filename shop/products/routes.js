const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/create-product',
    auth.isAuthenticated,
    actions.createProduct);

router.get('/categories',
    actions.getCategories);

router.get('/products/',
    actions.getProducts);

router.get('/product/:id',
    actions.getProduct);


module.exports = router;
