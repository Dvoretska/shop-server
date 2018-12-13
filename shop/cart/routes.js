const actions = require('./actions');
const auth = require('../../services/auth');


const router = require('express').Router();


router.post('/',
    auth.isAuthenticated,
    actions.addProductToCart);

router.get('/',
    auth.isAuthenticated,
    actions.getCart);

router.delete('/',
    auth.isAuthenticated,
    actions.deleteProductFromCart);

router.post('/decrease',
    auth.isAuthenticated,
    actions.decreaseQuantityOfProductInCart);

router.get('/number',
    auth.isAuthenticated,
    actions.getTotalNumberOfProductsInCart);


module.exports = router;
