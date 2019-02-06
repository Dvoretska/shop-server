const path = require('path');
const fs = require('fs');
const multipleUpload = require('../../services/multipleUpload');
const handleImagesTable = require('../../services/handleImagesTable');
const {Product, Image, Images, Stock} = require('./models');
const {Subcategory} = require('../categories/models');
const deleteImage = require('../../services/deleteImage');
const knex = require('../../knex');

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
      var files = [];
      for (let file of req.files) {
        files.push({image: file.location, product_id: product.attributes.id});
      }
      multipleUpload(req, res, (err) => {
        if (err) {
          return res.send({err});
        } else {
          let images = Images.forge(files);
          images.invokeThen('save').then(() => {
            return res.status(201).send({product_id: product.attributes.id})
          });
        }
      })
    })
  }).catch(err => {
    return next(err);
  })
}

function updateProduct(req, res, next) {
  const data = {
    brand: req.body.brand,
    price: JSON.parse(req.body.price),
    material: req.body.material,
    discount: JSON.parse(req.body.discount),
    description: req.body.description,
    subcategory_id: req.body.subcategory_id
  };
  let removedFilesBody = JSON.parse(req.body.removedFiles);
  let reqFilesBody = req.files;
  let product_id =  req.body.product_id;
  if(removedFilesBody.length) {
    var removedFiles = [];
    for(let removedFile of JSON.parse(req.body.removedFiles)) {
      removedFiles.push({filename: removedFile.split('/').slice(-1)[0]});
    }
    deleteImage(removedFiles).then(() => {
      Image.query(function (qb) {
         qb.whereIn('image', JSON.parse(req.body.removedFiles))
        }).destroy().then(() => {
         if(req.files.length) {
          return;
          } else {
          Product.where({id: product_id}).save(data, {patch: true}).then((product) => {
            return res.status(200).send({product});
          }).catch(err => {
            return next(err);
          })
        }
      })
    }).catch((err)=> {
      return next(err);
    });
  }
  if(reqFilesBody.length) {
    var files = [];
    for (let file of reqFilesBody) {
      files.push({image: file.location, product_id: product_id});
    }
    multipleUpload(req, res, (err) => {
      if (err) {
        return next(err);
      }
      let images = Images.forge(files);
      images.invokeThen('save').then(() => {
        Product.where({id: product_id}).save(data, {patch: true}).then((product) => {
          return res.status(200).send({product});
        }).catch(err => {
          return next(err);
        })
      })
    })
  }

  if(!removedFilesBody.length && !reqFilesBody.length) {
    Product.where({id: product_id}).save(data, {patch: true}).then((product) => {
      return res.status(200).send({product});
    }).catch(err => {
      return next(err);
    })
  }
}

function deleteProduct(req, res, next) {
  Product.where({id: req.body.product_id}).destroy().then(() => {
    return res.status(200).send({success: 'ok'});
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

function getProductsFromStock(req, res, next) {
  let offset = req.query.offset || 0;
  let limit = req.query.limit || 10;
  knex.raw(`SELECT SUM(s.quantity) as quantity, 
            p.*, sub.name as subcategory_name, 
            c.name as category_name
            FROM stock s 
            RIGHT OUTER JOIN products p ON s.product_id = p.id
            JOIN subcategories sub ON p.subcategory_id = sub.id 
            JOIN categories c ON sub.category_id = c.id
            GROUP BY s.product_id, p.id, sub.name, c.name
            ORDER BY p.brand LIMIT ${limit} OFFSET ${offset}`).then((result) => {
    knex.raw(`SELECT COUNT(products.id) FROM products`).then((totalAmount) => {
      Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, result.rows, 'id');
        return res.status(200).send({'products': result.rows, 'totalAmount': totalAmount.rows[0].count});
      })
    }).catch(err => {
      return next(err);
    })
  });
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
  getProductsFromStock,
  getProductsBySearch,
  updateProduct,
  deleteProduct
};
