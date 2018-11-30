const path = require('path');
const fs = require('fs');
const multipleUpload = require('../../services/multipleUpload');
const handleImagesTable = require('../../services/handleImagesTable');
const {Product, Category, Image} = require('./models');


function createProduct(req, res) {
  const product = new Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    category_id: req.body.category_id
  });
  product.save().then(() => {
    Product.forge({id: product.id}).fetch({withRelated: ['category_id']}).then((product) => {
      let files = [];
      for(let file of req.files) {
        files.push({image: file.filename, product_id: product.attributes.id})
      }
      multipleUpload(req, res, (err) => {
        if (err) {
          return res.send({err});
        } else {
          let images = Images.forge(files);
          images.invokeThen('save').then((images) => {
            return res.status(201).send({product, images})
          })
        }
      })
    })
  })
}

function getCategories(req, res) {
  Category.forge().fetchAll().then(categories => {
    if(!categories) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).send(categories)
  })
}

function getProducts(req, res) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let category = req.query.category || 1;
  Product.where({category_id: category}).query(function(qb) {
    qb.count('category_id');
  }).fetchAll().then((count)=> {
    Product.where({category_id: category}).query(function(qb) {
      qb.offset(skip).limit(limit);
    }).fetchAll({
      withRelated: ['category_id']}).then(products => {
      if (!products) {
        return res.status(404).send('Not Found');
      }
      Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
          return res.status(200).send({'products': products, 'totalAmount': count});
        });
      })
    }
  )
}

function getProduct(req, res) {
  Product.forge({id: req.params.id}).fetch({
    withRelated: ['category_id']}).then(product => {
    if (!product) {
      return res.status(404).send('Not Found');
    }
    Image.forge().fetchAll({withRelated: 'product'}).then(images => {
      handleImagesTable.addImagesToResult(images, product, 'id', 'attributes');
      return res.status(200).send(product);
    });
  })
}


module.exports = {
  createProduct,
  getCategories,
  getProducts,
  getProduct
};