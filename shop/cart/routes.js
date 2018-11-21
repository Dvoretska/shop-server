const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();


router.post('/add-to-cart',
    auth.isAuthenticated,
    actions.addProductToCart);

router.get('/cart',
    auth.isAuthenticated,
    actions.getCart);

router.delete('/delete-from-cart',
    auth.isAuthenticated,
    actions.deleteProductFromCart);

router.post('/decrease-cart',
    auth.isAuthenticated,
    actions.decreaseQuantityOfProductInCart);

router.get('/number-products',
    auth.isAuthenticated,
    actions.getTotalNumberOfProductsInCart);


module.exports = router;
