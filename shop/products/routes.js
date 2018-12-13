const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/product',
    auth.isAuthenticated,
    actions.createProduct);

router.get('/products/search',
    actions.getProductsBySearch);

router.get('/categories',
    actions.getCategories);

router.get('/products',
    actions.getProducts);

router.get('/product/:id',
    actions.getProduct);


module.exports = router;
