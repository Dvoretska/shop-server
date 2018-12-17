const {Category, Subcategory} = require('./models');
const knex = require('../../knex');


function getCategories(req, res) {
  Category.forge().fetchAll().then(categories => {
    if(!categories) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).send(categories);
  })
}

function getSubcategories(req, res) {
  Subcategory.where({category_id: req.params.category_id}).fetchAll({withRelated: ['category']}).then(subcategories => {
    if(!subcategories) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).send(subcategories);
  })
}

function getCategoriesTree(req, res) {
  knex.raw(`SELECT array_to_json(array_agg(json_build_object('value', s.id, 'text', s.name))) children, c.name as text, c.id as value
            FROM subcategories s 
            JOIN categories c ON s.category_id = c.id 
            GROUP BY c.name, c.id 
            ORDER BY c.name`).then((result) => {
    return res.status(200).send({categoriesTree: result.rows})
  }).catch((err) => {
    return res.status(404).send({err});
  })
}

function deleteSubcategories(req, res) {
  console.log(req.body, 'fff')
  Subcategory.query().whereIn('id', req.body.subcategories).del().then((res)=>{
    return res.status(200).send(res)
  }).catch(err => {
    return res.status(400).send(err)
  })
}


module.exports = {
  getCategories,
  getSubcategories,
  getCategoriesTree,
  deleteSubcategories
};
