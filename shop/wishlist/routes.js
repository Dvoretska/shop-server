const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/add-to-wishlist',
    auth.isAuthenticated,
    actions.addProductToWishlist);

router.delete('/delete-from-wishlist',
    auth.isAuthenticated,
    actions.deleteProductFromWishlist);

router.get('/wishlist',
    auth.isAuthenticated,
    actions.getWishlist);

router.get('/number-wishlist',
    auth.isAuthenticated,
    actions.totalNumOfProductsInWishlist);

module.exports = router;
