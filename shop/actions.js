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
    models.Product.forge({id: product.id}).fetch({withRelated: ['category_id']}).then((product) => {
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
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  models.Product.forge().query(function(qb) {
    qb.count('id');
  }).fetchAll().then((count)=> {
    models.Product.forge().query(function(qb) {
      qb.offset(skip).limit(limit);
    }).fetchAll({
      withRelated: ['category_id']}).then(products => {
      if (!products) {
        return res.status(404).send('Not Found');
      }
      models.Image.forge().fetchAll({withRelated: 'product'}).then(result => {
        let groups = {};
        let changedArr;
        let groupName;
        result.map((img) => {
          groupName = img.attributes.product_id;
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(img.attributes.image);
          changedArr = products.forEach((item) => {
            if(+item.id === +groupName) {
              item.attributes['images'] = groups[groupName];
            }
          });
        });
        return res.status(200).send({'products': changedArr, 'totalAmount': count});
      });
    })
    }
  )

}

function getProduct(req, res) {
  models.Product.forge({id: req.params.id}).fetch({
    withRelated: ['category_id']}).then(product => {
    if (!product) {
      return res.status(404).send('Not Found');
    }
    models.Image.forge().fetchAll({withRelated: 'product'}).then(result => {
      var groups = {};
      var groupName;
      result.map((img) => {
        groupName = img.attributes.product_id;
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(img.attributes.image);
          if(product.id == groupName) {
            product.attributes['images'] = groups[groupName];
          }
      });
      return res.status(200).send({product});
    });
  })
}

function addProductToCart(req, res) {
  models.Cart.forge({product_id: req.body.product_id, size: req.body.size}).query('orderBy', 'id', 'desc').fetch().then((model) => {
    if(model && model.attributes.size === req.body.size) {
      models.Cart.where({product_id: req.body.product_id, size: model.attributes.size})
        .save({quantity: req.body.quantity + model.attributes.quantity}, {patch: true})
        .then((result) => {
          return res.status(201).send({success: result});
        }).catch(err => {
          return res.status(400).send(err)
        })
    } else {
      const cart = new models.Cart({
        quantity: req.body.quantity || 1,
        product_id: req.body.product_id,
        size: req.body.size,
        user_id: req.user.attributes.id
      });
      cart.save().then((cart) => {
        return res.status(201).send({success: cart});
      }).catch(err => {
        return res.status(400).send(err)
      })
    }
  })
}


module.exports = {createProduct, getCategories, getProducts, getProduct, addProductToCart};
