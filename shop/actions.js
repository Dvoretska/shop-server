const models = require('./models');
const path = require('path');
const fs = require('fs');
const multipleUpload = require('../services/multipleUpload');
var _ = require('lodash');

function createProduct(req, res) {
  const product = new models.Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    category_id: req.body.category_id
  });
  product.save().then(() => {
    models.Product.forge({id: product.id}).fetch({withRelated: ['category']}).then((product) => {
      let files = [];
      for(let file of req.files) {
        files.push({image: file.filename, product_id: product.attributes.id})
      }
      multipleUpload(req, res, (err) => {
        if (err) {
          return res.send({err});
        } else {
          let images = models.Images.forge(files);
          images.invokeThen('save').then((images) => {
            return res.status(201).send({product, images})
          })
        }
      })
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

function getProducts(req, res) {
  models.Product.forge().fetchAll().then(products => {
    if (!products) {
      return res.status(404).send('Not Found');
    }
    models.Image.forge().fetchAll({withRelated: 'product'}).then(result => {
      var groups = {};
      var changedArr;
      var groupName;
      result.map((img) => {
        groupName = img.attributes.product_id;
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(img.attributes.image);
        changedArr = products.forEach((item) => {
          if(item.id == groupName) {
            item.attributes['images'] = groups[groupName];
          }
        });
      });
      return res.status(200).send({products: changedArr});
    });
  })

}


module.exports = {createProduct, getCategories, getProducts};
