const actions = require('./actions');
const auth = require('../../services/auth');
const validation = require('../../services/validation');

const router = require('express').Router();

router.get('/categories',
    actions.getCategories);

router.get('/categories-tree',
    actions.getCategoriesTree);

router.delete('/subcategories/delete',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.deleteSubcategories);

router.get('/subcategories',
    actions.getSubcategories);

router.post('/category/add',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.addCategory);

router.post('/subcategory/add',
    auth.isAuthenticated,
    validation.allowedRoles(['admin']),
    actions.saveAdditionalSubcategory);

module.exports = router;
