const models = require('./models');
const shop = require('../shop/models');
const path = require('path');
const fs = require('fs');
const multipleUpload = require('../services/multipleUpload');

function createProduct(req, res) {
  const product = new models.Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    category_id: req.body.category_id
  });
  product.save().then((product) => {
    let files = [];
    for(let file of req.files) {
      files.push({image: file.filename, product_id: product.attributes.id})
    }
    multipleUpload(req, res, (err) => {
      if (err) {
        return res.send({success: false});
      } else {
        var images = models.Images.forge(files);
        images.invokeThen('save').then(() => {return res.status(201).send({success:true})});
      }
    })
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
