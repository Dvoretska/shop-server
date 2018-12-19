const {Category, Subcategory} = require('./models');
const knex = require('../../knex');
const slugify = require('slugify');


const ERROR_MAPPING = {
  '23505': {message: 'Category already exists'}
};

function getCategories(req, res, next) {
  Category.forge().fetchAll().then(categories => {
    if(!categories) {
      return next();
    }
    return res.status(200).send(categories);
  })
}

function getSubcategories(req, res, next) {
  Subcategory.where({category_id: req.params.category_id}).fetchAll({withRelated: ['category']}).then(subcategories => {
    if(!subcategories) {
      return next();
    }
    return res.status(200).send(subcategories);
  })
}

function deleteSubcategories(req, res) {
  let subcategories = JSON.parse(req.body.subcategories);
  let arr = [];
  for(let i = 0; i < subcategories.length; i++) {
    arr.push(subcategories[i]);
  }
  Subcategory.query(qb => { qb.whereIn('id', arr) }).destroy().then((res)=>{
    return res.status(200).send({ids: subcategories})
  }).catch(err => {
    return res.status(400).send(err)
  })
}

function addCategory(req, res, next) {
  const category = new Category({
    name: req.body.category,
    slug: slugify(req.body.category, {
      lower: true
    })
  });
  return category.save().then((category) => {
    const transformedCategory = {text: category.attributes.name, value: category.attributes.id, slug: category.attributes.slug};
    return res.status(201).send({category: transformedCategory})
  }).catch(err => {
    return next(ERROR_MAPPING[err.code] || err);
  })
}

function getCategoriesTree(req, res, next) {
  knex.raw(`SELECT array_to_json(array_agg(json_build_object('value', s.id, 'text', s.name, 'slug', s.slug))) children, c.name as text, c.id as value, c.slug as slug
            FROM subcategories s 
            JOIN categories c ON s.category_id = c.id 
            GROUP BY c.name, c.id, c.slug 
            ORDER BY c.name`).then((result) => {
  if(!result) {
    return next();
  }
    return res.status(201).send({categoriesTree: result.rows})
  }).catch((err) => {
    return res.status(404).send({err});
  })
}


module.exports = {
  getCategories,
  getSubcategories,
  getCategoriesTree,
  deleteSubcategories,
  addCategory
};
