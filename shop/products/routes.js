const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/product',
    auth.isAuthenticated,
    actions.createProduct);

router.get('/products/search',
    actions.getProductsBySearch);

router.get('/products',
    actions.getProducts);

router.get('/all-products',
    actions.getAllProducts);

router.get('/product/:id',
    actions.getProduct);


module.exports = router;
