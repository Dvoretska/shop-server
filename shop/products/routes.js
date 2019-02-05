const actions = require('./actions');
const auth = require('../../services/auth');
const validation = require('../../services/validation');

const router = require('express').Router();

router.post('/product',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    validation.isImageValid,
    actions.createProduct);

router.post('/product/update',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.updateProduct);

router.delete('/product/delete',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.deleteProduct);

router.get('/products/search',
    actions.getProductsBySearch);

router.get('/products',
    actions.getProducts);

router.get('/all-products',
    actions.getAllProducts);

router.get('/product/:id',
    actions.getProduct);


module.exports = router;
