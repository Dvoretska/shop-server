const path = require('path');
const fs = require('fs');
const multipleUpload = require('../../services/multipleUpload');
const handleImagesTable = require('../../services/handleImagesTable');
const {Product, Category, Image, Images, Subcategory} = require('./models');
const knex = require('../../knex');
const _ = require('lodash');

function createProduct(req, res) {
  const product = new Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    subcategory_id: req.body.subcategory_id
  });
  product.save().then(() => {
    Product.forge({id: product.id}).fetch({withRelated: ['subcategory_id']}).then((product) => {
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

function getCategoriesTree(req, res) {
  knex.raw(`SELECT array_to_json(array_agg(json_build_object('id', s.id, 'name', s.name))) children, c.name, c.id FROM subcategories s JOIN categories c ON s.category_id = c.id GROUP BY c.name, c.id`).then((result) => {
    return res.status(200).send({categoriesTree: result.rows})
  }).catch((err) => {
    return res.status(404).send('Not Found');
  })
}

function getSubcategories(req, res) {
  Subcategory.where({category_id: req.params.category_id}).fetchAll({withRelated: ['category']}).then(subcategories => {
    if(!subcategories) {
      return res.status(404).send('Not Found');
    }
    return res.status(200).send(subcategories)
  })
}

function getProducts(req, res) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let subcategory = req.query.subcategory || 1;
  Product.where({subcategory_id: subcategory}).query(function(qb) {
    qb.count('subcategory_id');
  }).fetchAll().then((count)=> {
    Product.where({subcategory_id: subcategory}).query(function(qb) {
      qb.offset(skip).limit(limit).orderBy('id','desc');
    }).fetchAll({withRelated: ['subcategory_id']}).then(products => {
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

function getProductsBySearch(req, res) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let searchQuery = req.query.search;
  let searchQueryLowerCase = searchQuery.toLowerCase();
  Product.query(function (qb) {
    qb.whereRaw(`LOWER(brand) LIKE ?`, [`%${searchQueryLowerCase}%`]).count('id')
  }).fetchAll().then((count)=> {
    Product.query(function (qb) {
      qb.whereRaw(`LOWER(brand) LIKE ?`, [`%${searchQueryLowerCase}%`]).offset(skip).limit(limit).orderBy('id','desc')
    }).fetchAll().then((products) => {
      Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
        return res.status(200).send({'products': products, 'totalAmount': count});
      });
    })
  })
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
  getProduct,
  getProductsBySearch,
  getSubcategories,
  getCategoriesTree
};
