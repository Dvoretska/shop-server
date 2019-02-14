const {Cart} = require('./models');
const {Image, Stock} = require('../products/models');
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
      if(stock.attributes.quantity >= 1) {
        let stock_quantity = stock.attributes.quantity - 1;
        await Stock.where(dataForStock).save({quantity: stock_quantity}, {patch: true});
        let cart_quantity = cart_item.attributes.quantity + 1;
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

async function getCart(req, res, next) {
  try {
    let cart = await Cart.where({user_id: req.user.attributes.id}).query('orderBy', 'quantity', 'desc')
      .fetchAll({withRelated: ['product_id.subcategory.category', 'size_id']});
    if (!cart) {
      return next();
    }
    let cartArr = [];
    cart.map((cart_item) => {
      var cart_obj = {};
      cart_obj['category'] = cart_item.relations.product_id.relations.subcategory.relations.category.attributes.name;
      cart_obj['id'] = cart_item.attributes.id;
      cart_obj['size'] = cart_item.relations.size_id.attributes.name;
      cart_obj['size_id'] = cart_item.relations.size_id.attributes.id;
      cart_obj['product_id'] = cart_item.relations.product_id.attributes.id;
      cart_obj['quantity'] = cart_item.attributes.quantity;
      cart_obj['brand'] = cart_item.relations.product_id.attributes.brand;
      cart_obj['price'] = cart_item.relations.product_id.attributes.price;
      if (cart_item.relations.product_id.attributes.discount) {
        cart_obj['discount'] = cart_item.relations.product_id.attributes.discount;
        cart_obj['amount'] = cart_obj['quantity'] * cart_obj['discount'];
      } else {
        cart_obj['amount'] = cart_obj['quantity'] * cart_obj['price'];
      }
      cartArr.push(cart_obj);
    });
    let images = await Image.forge().fetchAll({withRelated: 'product'});
    handleImagesTable.addImagesToResult(images, cartArr, 'product_id');
    let totalNumberOfProducts = summary.calcTotalNumberOfProducts(cart);
    let totalAmount = summary.calcTotalAmount(cart);
    return res.status(200).send({cart: cartArr, totalAmount, totalNumberOfProducts})
  }
  catch(err) {
    return next(err);
  }
}

async function decreaseQuantityOfProductInCart(req, res, next) {
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
    let stock = await Stock.where(dataForStock).fetch();
    let stock_quantity = stock.attributes.quantity + 1;
    await Stock.where(dataForStock).save({quantity: stock_quantity}, {patch: true});
    let cart = await Cart.forge(data).fetch({withRelated: ['product_id']});
    let cart_quantity = cart.attributes.quantity - 1;
    let cart_quantity_updated = await Cart.where(data).save({quantity: cart_quantity}, {patch: true});
    let cart_updated = await Cart.where(data).fetch();
    let all_cart = await Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
    let amount = 0;
    if (cart.relations.product_id.attributes.discount) {
      amount = cart.relations.product_id.attributes.discount * cart_updated.attributes.quantity;
    } else {
      amount = cart.relations.product_id.attributes.price * cart_updated.attributes.quantity;
    }
    let totalAmount = summary.calcTotalAmount(all_cart);
    let totalNumberOfProducts = summary.calcTotalNumberOfProducts(all_cart);
    return res.status(201).send({
      product: cart_updated,
      productQty: cart_quantity_updated,
      amount,
      totalAmount,
      totalNumberOfProducts
    });
  }
  catch (err) {
    return next(err);
  }
}

async function deleteProductFromCart(req, res, next) {
  try {
     await Cart.where({id: req.body.id, user_id: req.user.attributes.id}).destroy();
     let cart = await Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
     let totalAmount = summary.calcTotalAmount(cart);
     let totalNumberOfProducts = summary.calcTotalNumberOfProducts(cart);
     return res.status(201).send({id: req.body.id, totalAmount, totalNumberOfProducts});
  }
  catch(err) {
    return next(err);
  }
}

async function getTotalNumberOfProductsInCart(req, res, next) {
  try {
    let cart = await Cart.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
    let totalNumberOfProducts = summary.calcTotalNumberOfProducts(cart);
    return res.status(201).send({totalNumberOfProducts});
  }
  catch(err) {
    return next(err);
  }
}

module.exports = {
  addProductToCart,
  getCart,
  decreaseQuantityOfProductInCart,
  deleteProductFromCart,
  getTotalNumberOfProductsInCart
};
