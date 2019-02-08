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

router.get('/product/quantity/:id',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.getSizesQuantity);

router.get('/products',
    actions.getProducts);

router.get('/stock-products',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.getProductsFromStock);

router.post('/product/quantity/update',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.updateSizesQuantity);

router.get('/product/:id',
    actions.getProduct);

router.get('/sizes',
    actions.getSizes);

router.post('/sizes/add',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.addSize);

router.post('/stock/add',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.addQuantityToStock);

router.delete('/sizes/delete',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.deleteSizes);

module.exports = router;
