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

router.get('/products/',
    actions.getProducts);

router.get('/product/:id',
    actions.getProduct);

router.post('/add-to-cart',
    auth.isAuthenticated,
    actions.addProductToCart);

router.get('/cart',
    auth.isAuthenticated,
    actions.getCart);

router.delete('/delete-from-cart',
    auth.isAuthenticated,
    actions.deleteProductFromCart);

router.post('/update-cart',
    auth.isAuthenticated,
    actions.decreaseQuantityOfProductInCart);


module.exports = router;
