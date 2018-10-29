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

router.get('/number-products',
    auth.isAuthenticated,
    actions.getTotalNumberOfProducts);

router.post('/add-to-wishlist',
    auth.isAuthenticated,
    actions.addProductToWishlist);

router.delete('/delete-from-wishlist',
    auth.isAuthenticated,
    actions.deleteProductFromWishlist);

router.get('/wishlist',
    auth.isAuthenticated,
    actions.getWishlist);

module.exports = router;
