const {Cart} = require('./models');
const {Image, Stock} = require('../products/models');
const {Category} = require('../categories/models');
const handleImagesTable = require('../../services/handleImagesTable');
const summary = require('../../services/summary');


async function addProductToCart(req, res, next) {
  let data = {
    product_id: req.body.product_id,
    size_id: req.body.size_id,
    user_id: req.user.attributes.id
  };
  let dataForStock = {
    product_id: req.body.product_id,
    size_id: req.body.size_id
  };
  try {
    let cart_item = await Cart.where(data).fetch({withRelated: ['product_id']});
    if(cart_item) {
      let stock = await Stock.where(dataForStock).fetch();
      if(stock.attributes.quantity >= req.body.quantity) {
        let stock_quantity = stock.attributes.quantity - req.body.quantity;
        await Stock.where(dataForStock).save({quantity: stock_quantity}, {patch: true});
        let cart_quantity = req.body.quantity + cart_item.attributes.quantity;
        let product_quantity = await Cart.where(data).save({quantity: cart_quantity}, {patch: true});
        let cart_item_updated = await Cart.where(data).fetch({withRelated: ['product_id']});
        let amount = 0;
        if (cart_item_updated.relations.product_id.attributes.discount) {
           amount = cart_item_updated.relations.product_id.attributes.discount * cart_item_updated.attributes.quantity;
        } else {
           amount = cart_item_updated.relations.product_id.attributes.price * cart_item_updated.attributes.quantity;
        }
        let all_cart = await Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
        let totalAmount = summary.calcTotalAmount(all_cart);
        let totalNumberOfProducts = summary.calcTotalNumberOfProducts(all_cart);
        return res.status(201).send({message: '', product: cart_item_updated, productQty: product_quantity, amount, totalAmount, totalNumberOfProducts});
      } else {
        return res.status(200).send({message: 'This product is currently out of stock'});
      }
    } else {
      const cart = new Cart({
        quantity: 1,
        product_id: req.body.product_id,
        size_id: req.body.size_id,
        user_id: req.user.attributes.id
      });
      let stock = await Stock.where(dataForStock).fetch();
      if(stock.attributes.quantity >= 1) {
        await cart.save();
        let cart_item_updated = await Cart.where(data).fetch({withRelated: ['product_id']});
        let stock_quantity = stock.attributes.quantity - 1;
        await Stock.where(dataForStock).save({quantity: stock_quantity}, {patch: true});
        let all_cart = await Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
        let totalAmount = summary.calcTotalAmount(all_cart);
        let totalNumberOfProducts = summary.calcTotalNumberOfProducts(all_cart);
        return res.status(201).send({product: cart_item_updated, productQty: {quantity: 1}, totalAmount, totalNumberOfProducts});
      }
      else {
        return res.status(200).send({message: 'This product is currently out of stock'});
      }
    }
  }
  catch(err) {
     return next(err);
  }
}

function getCart(req, res, next) {
  Cart.where({user_id: req.user.attributes.id})
      .query('orderBy', 'quantity', 'desc')
      .fetchAll({withRelated: ['product_id']})
      .then(products => {
        if(!products) {
          return next();
        }
        Category.forge().fetchAll().then(categories => {
          let cartArr = [];
          products.map((item) => {
            var cart = {};
            let category = categories.find(o =>  o.id === +item.relations.product_id.attributes.category_id);
            cart['category'] = category.attributes.name;
            cart['id'] = item.attributes.id;
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
          Image.forge().fetchAll({withRelated: 'product'}).then(images => {
            handleImagesTable.addImagesToResult(images, cartArr, 'product_id');
            let totalNumberOfProducts = summary.calcTotalNumberOfProducts(products);
            let totalAmount = summary.calcTotalAmount(products);
            return res.status(200).send({cart: cartArr, totalAmount, totalNumberOfProducts})
          })
        })
      })
}

function decreaseQuantityOfProductInCart(req, res) {
  Cart.forge({product_id: req.body.product_id, size: req.body.size, user_id: req.user.attributes.id}).query('orderBy', 'id', 'desc').fetch({withRelated: ['product_id']}).then((product) => {
    let quantity = +product.attributes.quantity - 1;
    Cart.where({product_id: req.body.product_id, size: product.attributes.size})
        .save({quantity: quantity}, {patch: true})
        .then((result) => {
          let amount = 0;
          if(product.relations.product_id.attributes.discount) {
            amount = product.relations.product_id.attributes.discount * quantity;
          } else {
            amount = product.relations.product_id.attributes.price * quantity;
          }
          Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(total => {
            let totalAmount = summary.calcTotalAmount(total);
            let totalNumberOfProducts = summary.calcTotalNumberOfProducts(total);
            return res.status(201).send({product, productQty: result, amount, totalAmount, totalNumberOfProducts});
          }).catch(err => {
            return res.status(400).send(err)
          })
        });
  })
}

function deleteProductFromCart(req, res) {
  Cart.where({id: req.body.id, user_id: req.user.attributes.id}).destroy().then((product) => {
    Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(result => {
      let totalAmount = summary.calcTotalAmount(result);
      let totalNumberOfProducts = summary.calcTotalNumberOfProducts(result);
      return res.status(201).send({id: req.body.id, totalAmount, totalNumberOfProducts});
    }).catch(err => {
      return res.status(400).send(err)
    })
  })
}

function getTotalNumberOfProductsInCart(req, res) {
  Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(total => {
    let totalNumberOfProducts = summary.calcTotalNumberOfProducts(total);
    return res.status(201).send({totalNumberOfProducts});
  }).catch(err => {
    return res.status(400).send(err)
  })
}



module.exports = {
  addProductToCart,
  getCart,
  decreaseQuantityOfProductInCart,
  deleteProductFromCart,
  getTotalNumberOfProductsInCart
};
