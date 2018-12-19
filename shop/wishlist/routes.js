const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/add',
    auth.isAuthenticated,
    actions.addProductToWishlist);

router.delete('/delete',
    auth.isAuthenticated,
    actions.deleteProductFromWishlist);

router.get('/',
    auth.isAuthenticated,
    actions.getWishlist);

router.get('/number',
    auth.isAuthenticated,
    actions.totalNumOfProductsInWishlist);

module.exports = router;
