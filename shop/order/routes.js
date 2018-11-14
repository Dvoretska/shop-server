const actions = require('./actions');
const validation = require('../../services/validation');
const auth = require('../../services/auth');


const router = require('express').Router();

router.post('/create-order',
    auth.isAuthenticated,
    actions.createOrder);

router.get('/get-order/:id',
    auth.isAuthenticated,
    actions.getOrder);

module.exports = router;
