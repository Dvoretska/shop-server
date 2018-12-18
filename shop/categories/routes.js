const actions = require('./actions');

const router = require('express').Router();

router.get('/categories',
    actions.getCategories);

router.get('/categories-tree',
    actions.getCategoriesTree);

router.delete('/subcategories',
    actions.deleteSubcategories);

router.get('/subcategories/:category_id',
    actions.getSubcategories);

module.exports = router;
