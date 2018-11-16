const actions = require('./actions');
const validation = require('../../services/validation');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/create-order',
    auth.isAuthenticated,
    actions.createOrder);

router.get('/order/:id',
    auth.isAuthenticated,
    validation.isAllowedToCurrentUserOnly(),
    actions.getOrder);

router.get('/orders',
    auth.isAuthenticated,
    actions.getOrders);

module.exports = router;
