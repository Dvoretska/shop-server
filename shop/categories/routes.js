const actions = require('./actions');

const router = require('express').Router();

router.get('/categories',
    actions.getCategories);

router.get('/categories-tree',
    actions.getCategoriesTree);

router.get('/subcategories/:category_id',
    actions.getSubcategories);

router.delete('/subcategories/delete',
    actions.deleteSubcategories);

module.exports = router;
