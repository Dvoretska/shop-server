const handleImagesTable = require('../../services/handleImagesTable');
const {Wishlist} = require('./models');
const {Image} = require('../products/models');
const {Category, Subcategory} = require('../categories/models');

function addProductToWishlist(req, res, next) {
  const wishlistItem = new Wishlist({
    product_id: req.body.product_id,
    user_id: req.user.attributes.id
  });
  return wishlistItem.save().then(() => {
    return Wishlist.where({user_id: req.user.attributes.id}).query(function(qb) {
      qb.count('id');
    }).fetch().then((count) => {
      return Wishlist.where({user_id: req.user.attributes.id, product_id: req.body.product_id}).fetch({withRelated: ['product_id']}).then((item) => {
        return res.status(201).send({item, count});
      })
    })
  }).catch(err => {
    return next(err);
  })
}

function deleteProductFromWishlist(req, res, next) {
  Wishlist.where({product_id: req.body.product_id}).destroy().then(() => {
    return Wishlist.where({user_id: req.user.attributes.id}).query(function(qb) {
      qb.count('id');
    }).fetchAll().then(count => {
      return res.status(201).send({product_id: req.body.product_id, count});
    })
  }).catch(err => {
    return next(err);
  })
}

function getWishlist(req, res, next) {
  Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id.subcategory_id.category']}).then(items => {
    if (!items) {
      return next();
    }
    let wishlistArr = [];
    items.map(item => {
      var wishlistObj = {};
      wishlistObj['id'] = item.attributes.id;
      wishlistObj['subcategory'] = item.relations.product_id.relations.subcategory_id.attributes.name;
      wishlistObj['category'] = item.relations.product_id.relations.subcategory_id.relations.category.attributes.name;
      wishlistObj['product_id'] = item.relations.product_id.attributes.id;
      wishlistObj['brand'] = item.relations.product_id.attributes.brand;
      wishlistObj['price'] = item.relations.product_id.attributes.price;
      if (item.relations.product_id.attributes.discount) {
        wishlistObj['discount'] = item.relations.product_id.attributes.discount;
      }
      wishlistArr.push(wishlistObj);
    });
    return Image.forge().fetchAll({withRelated: 'product'}).then(images => {
      handleImagesTable.addImagesToResult(images, wishlistArr, 'product_id');
      let totalNumOfProductsInWishlist = wishlistArr.length;
      return res.status(200).send({wishlist: wishlistArr, totalNumOfProductsInWishlist})
    })
  }).catch(err => {
    return next(err);
  })
}


function totalNumOfProductsInWishlist(req, res, next) {
  Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(total => {
    return res.status(201).send({total: total.length});
  }).catch(err => {
    return next(err);
  })
}


module.exports = {
  addProductToWishlist,
  deleteProductFromWishlist,
  getWishlist,
  totalNumOfProductsInWishlist
};
