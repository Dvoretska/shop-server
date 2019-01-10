const {Category, Subcategory} = require('./models');
const {Product} = require('../products/models');
const knex = require('../../knex');
const slugify = require('slugify');


const ERROR_MAPPING = {
  '23505': {message: 'The specified item already exists'}
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
  if(req.query.category_id) {
    Subcategory.where({category_id: req.query.category_id}).fetchAll({withRelated: ['category']}).then(subcategories => {
      if(!subcategories) {
        return next();
      }
      return res.status(200).send(subcategories);
    })
  } else {
    Product.where({id: req.query.product_id}).fetchAll({withRelated: ['subcategory.category']}).then(products => {
      if(!products) {
        return next();
      }
      let category_id;
      products.map((product) => {
        category_id = product.relations.subcategory.relations.category.attributes.id;
      });
      Subcategory.where({category_id: category_id}).fetchAll().then(subcategories => {
        return res.status(200).send(subcategories);
      });
    })
  }
}

function deleteSubcategories(req, res, next) {
  let subcategories = req.body.subcategories.split(',');
  let arr = [];
  for(let i = 0; i < subcategories.length; i++) {
    arr.push(+subcategories[i]);
  }
  Subcategory.query(qb => { qb.whereIn('id', arr) }).destroy().then(()=>{
    return knex.raw(`DELETE FROM categories
      WHERE id IN
      (SELECT c.id
      FROM categories c
      LEFT JOIN subcategories s
      ON s.category_id = c.id
      WHERE s.name IS NULL)`).then(() => {
        return res.status(200).send({success: 'ok'})
    })
  }).catch(err => {
    return next(ERROR_MAPPING[err.code] || err);
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
    if(req.body.subcategory) {
      const subcategory = new Subcategory({
        name: req.body.subcategory,
        slug: slugify(req.body.subcategory, {
          lower: true
        }),
        category_id: category.id
      });
      return subcategory.save().then((subcategory) => {
        return res.status(201).send({subcategory})
      })
    } else {
      return res.status(201).send({category})
    }
  }).catch(err => {
    return next(ERROR_MAPPING[err.code] || err);
  })
}

function saveAdditionalSubcategory(req, res, next) {
  const subcategory = new Subcategory({
    name: req.body.subcategory,
    slug: slugify(req.body.subcategory, {
      lower: true
    }),
    category_id: req.body.category_id
  });
  return subcategory.save().then((subcategory) => {
    const transformedSubcategory = {
      text: subcategory.attributes.name,
      value: subcategory.attributes.id,
      slug: subcategory.attributes.slug,
      category_id: subcategory.attributes.category_id
    };
    return res.status(201).send({subcategory: transformedSubcategory})
  }).catch(err => {
    return next(ERROR_MAPPING[err.code] || err);
  })
}

function getCategoriesTree(req, res, next) {
  knex.raw(`SELECT array_to_json(array_agg(json_build_object('value', s.id, 'text', s.name, 'slug', s.slug, 'checked', false))) children, c.name as text, c.id as value, c.slug as slug
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
  addCategory,
  saveAdditionalSubcategory
};
