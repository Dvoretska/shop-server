const models = require('./models');
const shop = require('../shop/models');
const path = require('path');
const fs = require('fs');
const multipleUpload = require('../services/multipleUpload');
const upload= require('../services/upload');

function createProduct(req, res) {
  console.log(req.files)
  const product = new models.Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    category_id: req.body.category_id
  });
  product.save().then(() => {
    return res.status(201).send({product});
  }).catch(err => {
    return res.status(400).send(err)
  })
}

function getCategories(req, res) {
  models.Category.forge().fetchAll().then(categories => {
    if(!categories) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).send(categories)
  })
}
// function getPosts(req, res) {
//   models.Post.forge().fetchAll({ columns: ['image', 'title', 'id'] }).then(posts => {
//     if(!posts) {
//       return res.status(404).send('Not Found');
//     }
//     const ids = posts.map((post) => {return post.id})
//     return res.status(200).send({posts, meta: ids})
//   });
// }


module.exports = {createProduct, getCategories};
