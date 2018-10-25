const models = require('./models');
const path = require('path');
const fs = require('fs');
const multipleUpload = require('../services/multipleUpload');
const handleImagesTable = require('../services/handleImagesTable');
const calcTotalAmount = require('../services/calcTotalAmount');

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
      models.Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, products, 'id', 'attributes');
          return res.status(200).send({'products': products, 'totalAmount': count});
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
    models.Image.forge().fetchAll({withRelated: 'product'}).then(images => {
      handleImagesTable.addImagesToResult(images, product, 'id', 'attributes');
      return res.status(200).send(product);
    });
  })
}

function addProductToCart(req, res) {
  models.Cart.forge({product_id: req.body.product_id, size: req.body.size}).query('orderBy', 'id', 'desc').fetch({withRelated: ['product_id']}).then((product) => {
    if(product && product.attributes.size === req.body.size) {
      let quantity = req.body.quantity + product.attributes.quantity;
      models.Cart.where({product_id: req.body.product_id, size: product.attributes.size})
        .save({quantity: quantity}, {patch: true})
        .then((result) => {
          let amount = 0;
          if(product.relations.product_id.attributes.discount) {
            amount = product.relations.product_id.attributes.discount * quantity;
          } else {
            amount = product.relations.product_id.attributes.price * quantity;
          }
          models.Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(total => {
            let totalAmount = calcTotalAmount.calcTotalAmount(total);
            return res.status(201).send({product, productQty: result, amount, totalAmount});
          }).catch(err => {
            return res.status(400).send(err)
          })
      });
    } else {
      const cart = new models.Cart({
        quantity: req.body.quantity || 1,
        product_id: req.body.product_id,
        size: req.body.size,
        user_id: req.user.attributes.id
      });
      cart.save().then(() => {
        models.Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(result => {
          let totalAmount = calcTotalAmount.calcTotalAmount(result);
          return res.status(201).send({productQty: {quantity: 1}, totalAmount});
        }).catch(err => {
          return res.status(400).send(err)
        })
      })
    }
  })
}


function getCart(req, res) {
  models.Cart.where({user_id: req.user.attributes.id}).query('orderBy', 'quantity', 'desc').fetchAll({withRelated: ['product_id']})
  .then(products => {
    if(!products) {
      return res.status(404).send('Not Found');
    }
    models.Category.forge().fetchAll().then(categories => {
      let cartArr = [];
      let totalNumberOfProducts = 0;
      products.map((item) => {
        var cart = {};
        let category = categories.find(o =>  o.id === +item.relations.product_id.attributes.category_id);
        cart['category'] = category.attributes.category;
        cart['size'] = item.attributes.size;
        cart['product_id'] = item.relations.product_id.attributes.id;
        cart['quantity'] = item.attributes.quantity;
        cart['brand'] = item.relations.product_id.attributes.brand;
        cart['price'] = item.relations.product_id.attributes.price;
        if(item.relations.product_id.attributes.discount) {
          cart['discount'] = item.relations.product_id.attributes.discount;
          cart['amount'] = cart['quantity'] * cart['discount'];
        } else {
          cart['amount'] = cart['quantity'] * cart['price'];
        }
        cartArr.push(cart);
      });
      models.Image.forge().fetchAll({withRelated: 'product'}).then(images => {
        handleImagesTable.addImagesToResult(images, cartArr, 'product_id');
        for (let i = 0; i < cartArr.length; i++) {
          totalNumberOfProducts += cartArr[i].quantity;
        }
        let totalAmount = calcTotalAmount.calcTotalAmount(products);
        return res.status(200).send({cart: cartArr, totalAmount, totalNumberOfProducts})
      })
    })
  })
}

function getTotalAmount(req, res) {
  models.Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(result => {
    if (!result) {
      return res.status(404).send('Not Found');
    }
    let cartArr = [];
    let totalAmount = 0;
    result.map((item) => {
      var cart = {};
      cart['quantity'] = item.attributes.quantity;
      cart['price'] = item.relations.product_id.attributes.price;
      if(item.relations.product_id.attributes.discount) {
        cart['discount'] = item.relations.product_id.attributes.discount;
        cart['amount'] = cart['quantity'] * cart['discount'];
      } else {
        cart['amount'] = cart['quantity'] * cart['price'];
      }
      cartArr.push(cart);
      for (let i = 0; i < cartArr.length; i++) {
        totalAmount += cartArr[i].amount;
      }
    });
    return res.status(200).send({totalAmount})
  })
}


module.exports = {createProduct, getCategories, getProducts, getProduct, addProductToCart, getCart, getTotalAmount};
