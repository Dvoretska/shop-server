const handleImagesTable = require('../../services/handleImagesTable');
const {Wishlist} = require('./models');
const {Image} = require('../products/models');
const {Category} = require('../categories/models');

function addProductToWishlist(req, res) {
  const wishlistItem = new Wishlist({
    product_id: req.body.product_id,
    user_id: req.user.attributes.id
  });
  wishlistItem.save().then(() => {
    Wishlist.where({user_id: req.user.attributes.id}).query(function(qb) {
      qb.count('id');
    }).fetch().then((count) => {
      Wishlist.where({user_id: req.user.attributes.id, product_id: req.body.product_id}).fetch({withRelated: ['product_id']}).then((item) => {
        return res.status(201).send({item, count});
      }).catch(err => {
        return res.status(400).send(err)
      })
    })
  })
}

function deleteProductFromWishlist(req, res) {
  Wishlist.where({product_id: req.body.product_id}).destroy().then(() => {
    Wishlist.where({user_id: req.user.attributes.id}).query(function(qb) {
      qb.count('id');
    }).fetchAll().then(count => {
      return res.status(201).send({product_id: req.body.product_id, count});
    }).catch(err => {
      return res.status(400).send(err)
    })
  })
}

function getWishlist(req, res) {
  Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']})
      .then(items => {
        if(!items) {
          return res.status(404).send('Not Found');
        }
        Category.forge().fetchAll().then(categories => {
          let wishlistArr = [];
          items.map((item) => {
            var wishlistObj = {};
            let category = categories.find(o =>  o.id === +item.relations.product_id.attributes.category_id);
            wishlistObj['id'] = item.attributes.id;
            wishlistObj['category'] = category.attributes.name;
            wishlistObj['product_id'] = item.relations.product_id.attributes.id;
            wishlistObj['brand'] = item.relations.product_id.attributes.brand;
            wishlistObj['price'] = item.relations.product_id.attributes.price;
            if (item.relations.product_id.attributes.discount) {
              wishlistObj['discount'] = item.relations.product_id.attributes.discount;
            }
            wishlistArr.push(wishlistObj);
          });
          Image.forge().fetchAll({withRelated: 'product'}).then(images => {
            handleImagesTable.addImagesToResult(images, wishlistArr, 'product_id');
            let totalNumOfProductsInWishlist = wishlistArr.length;
            return res.status(200).send({wishlist: wishlistArr, totalNumOfProductsInWishlist})
          })
        })
      })
}


function totalNumOfProductsInWishlist(req, res) {
  Wishlist.where({user_id: req.user.attributes.id}).fetchAll({withRelated: ['product_id']}).then(total => {
    return res.status(201).send({total: total.length});
  }).catch(err => {
    return res.status(400).send(err)
  })
}


module.exports = {
  addProductToWishlist,
  deleteProductFromWishlist,
  getWishlist,
  totalNumOfProductsInWishlist
};
