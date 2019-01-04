const path = require('path');
const fs = require('fs');
const multipleUpload = require('../../services/multipleUpload');
const handleImagesTable = require('../../services/handleImagesTable');
const {Product, Image, Images, Stock} = require('./models');
const {Subcategory} = require('../categories/models');

function createProduct(req, res, next) {
  const product = new Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    subcategory_id: req.body.subcategory_id
  });
  product.save().then(() => {
    return Product.forge({id: product.id}).fetch({withRelated: ['subcategory']}).then((product) => {
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
  }).catch(err => {
    return next(err);
  })
}

function getProducts(req, res, next) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let subcategory_slug = req.query.subcategory;
  let order_name = req.query.order_name || 'id';
  let order = req.query.order || 'desc';
  if(subcategory_slug) {
    Subcategory.where({slug: subcategory_slug}).fetch().then((subcategory) => {
      if (!subcategory) {
        return next();
      }
      return Product.where({subcategory_id: subcategory.id}).query(function(qb) {
        qb.count('subcategory_id');
      }).fetchAll().then((count)=> {
        return Product.where({subcategory_id: subcategory.id}).query(function(qb) {
          qb.offset(skip).limit(limit).orderBy('id','desc');
        }).fetchAll({withRelated: ['subcategory']}).then(products => {
          return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
            handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
            return res.status(200).send({'products': products, 'totalAmount': count});
          });
        })
      })
    }).catch(err => {
      return next(err);
    })
  } else {
    Product.forge().query(function(qb) {
      qb.count('id');
    }).fetchAll().then((count)=> {
      return Product.forge().query(function(qb) {
        qb.offset(skip).limit(limit);
      }).orderBy(order_name, order).fetchAll({withRelated: ['subcategory.category']}).then(products => {
        return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
          handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
          return res.status(200).send({'products': products, 'totalAmount': count});
        });
      })
    }).catch(err => {
      return next(err);
    })
  }
}

function getAllProducts(req, res, next) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let order_name = req.query.order_name || 'id';
  let order = req.query.order || 'desc';
  Product.forge().query(function(qb) {
    qb.count('id');
  }).fetchAll().then((count)=> {
    return Stock.forge().query(function(qb) {
      qb.offset(skip).limit(limit);
    }).orderBy(order_name, order).fetchAll({withRelated: ['product.subcategory.category', 'size']}).then(products => {
      return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, products, 'product_id', 'attributes');
        let arr =[];
        products.map(product => {
          var productObj = {};
          productObj['id'] = product.attributes.id;
          productObj['quantity'] = product.attributes.quantity;
          productObj['size'] = product.relations.size.attributes.name;
          productObj['images'] = product.attributes.images;
          productObj['subcategory'] = product.relations.product.relations.subcategory.attributes.name;
          productObj['category'] = product.relations.product.relations.subcategory.relations.category.attributes.name;
          productObj['product_id'] = product.relations.product.attributes.id;
          productObj['brand'] = product.relations.product.attributes.brand;
          productObj['price'] = product.relations.product.attributes.price;
          if (product.relations.product.attributes.discount) {
            productObj['discount'] = product.relations.product.attributes.discount;
          }
          arr.push(productObj);
        });
        return res.status(200).send({'products': arr, 'totalAmount': count});
      });
    })
  }).catch(err => {
    return next(err);
  })

}


function getProductsBySearch(req, res, next) {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 3;
  let searchQuery = req.query.search;
  let searchQueryLowerCase = searchQuery.toLowerCase();
  Product.query(function (qb) {
    qb.whereRaw(`LOWER(brand) LIKE ?`, [`%${searchQueryLowerCase}%`]).count('id')
  }).fetchAll().then((count)=> {
    return Product.query(function (qb) {
      qb.whereRaw(`LOWER(brand) LIKE ?`, [`%${searchQueryLowerCase}%`]).offset(skip).limit(limit).orderBy('id','desc')
    }).fetchAll().then((products) => {
      return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
        return res.status(200).send({'products': products, 'totalAmount': count});
      });
    })
  }).catch(err => {
    return next(err);
  })
}

function getProduct(req, res, next) {
  Product.forge({id: req.params.id}).fetch({withRelated: ['subcategory.category']}).then(product => {
    if (!product) {
      return next();
    }
    return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
      handleImagesTable.addImagesToResult(images, product, 'id', 'attributes');
      return res.status(200).send(product);
    })
  }).catch(err => {
    return next(err);
  })
}


module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getProductsBySearch,
  getAllProducts
};
