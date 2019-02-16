const handleImagesTable = require('../../services/handleImagesTable');
const {Wishlist} = require('./models');
const {Image} = require('../products/models');

async function addProductToWishlist(req, res, next) {
  try {
    const wishlistItem = new Wishlist({
      product_id: req.body.product_id,
      user_id: req.user.attributes.id
    });
    await wishlistItem.save();
    let count_items = await Wishlist.where({user_id: req.user.attributes.id}).query((qb) => {
      qb.count('id');
    }).fetch();
    let item = await Wishlist.where({user_id: req.user.attributes.id, product_id: req.body.product_id})
      .fetch({withRelated: ['product_id']});
    return res.status(201).send({item, count: count_items.attributes.count});
  }
  catch(err) {
    return next(err);
  }
}

async function deleteProductFromWishlist(req, res, next) {
  try {
    await Wishlist.where({product_id: req.body.product_id, user_id: req.user.attributes.id}).destroy();
    let count_items = await Wishlist.where({user_id: req.user.attributes.id}).query((qb) => {
      qb.count('id');
    }).fetch();
    return res.status(201).send({product_id: req.body.product_id, count: count_items.attributes.count});
  }
  catch(err) {
    return next(err);
  }
}

async function getWishlist(req, res, next) {
  try {
    let items = await Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id.subcategory.category']});
    if(!items) {
      return res.status(200).send({wishlist: [], totalNumOfProductsInWishlist: 0});
    }
    let wishlistArr = [];
    items.map(item => {
      var wishlistObj = {};
      wishlistObj['id'] = item.attributes.id;
      wishlistObj['subcategory'] = item.relations.product_id.relations.subcategory;
      wishlistObj['category'] = item.relations.product_id.relations.subcategory.relations.category.attributes.name;
      wishlistObj['product_id'] = item.relations.product_id.attributes.id;
      wishlistObj['brand'] = item.relations.product_id.attributes.brand;
      wishlistObj['price'] = item.relations.product_id.attributes.price;
      if (item.relations.product_id.attributes.discount) {
        wishlistObj['discount'] = item.relations.product_id.attributes.discount;
      }
      wishlistArr.push(wishlistObj);
    });
    let images = await Image.forge().fetchAll({withRelated: 'product'});
    handleImagesTable.addImagesToResult(images, wishlistArr, 'product_id');
    let totalNumOfProductsInWishlist = wishlistArr.length;
    return res.status(200).send({wishlist: wishlistArr, totalNumOfProductsInWishlist});
  }
  catch(err) {
    return next(err);
  }
}


async function totalNumOfProductsInWishlist(req, res, next) {
  try {
    let total = await Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']});
    return res.status(201).send({total: total.length});
  }
  catch(err) {
    return next(err);
  }
}


module.exports = {
  addProductToWishlist,
  deleteProductFromWishlist,
  getWishlist,
  totalNumOfProductsInWishlist
};
