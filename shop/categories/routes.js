const actions = require('./actions');

const router = require('express').Router();

router.get('/categories',
    actions.getCategories);

router.get('/categories-tree',
    actions.getCategoriesTree);

router.delete('/subcategories/delete',
    actions.deleteSubcategories);

router.get('/subcategories',
    actions.getSubcategories);

router.post('/category/add',
    actions.addCategory);

router.post('/subcategory/add',
    actions.saveAdditionalSubcategory);

module.exports = router;
