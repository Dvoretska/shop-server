const models = require('./models');
const upload = require('../services/upload');
const shop = require('../shop/models');


function createProduct(req, res) {
  console.log(req)
  const product = new models.Product({
    brand: req.body.brand,
    price: req.body.price,
    material: req.body.material,
    discount: req.body.discount,
    description: req.body.description,
    category_id: req.body.category_id
  });
  product.save().then((product) => {
    console.log(product.relations)
    return res.status(201).send({product});
  }).catch(err => {
    return res.status(400).send(err)
  })
}

// function getPosts(req, res) {
//   models.Post.forge().fetchAll({ columns: ['image', 'title', 'id'] }).then(posts => {
//     if(!posts) {
//       return res.status(404).send('Not Found');
//     }
//     const ids = posts.map((post) => {return post.id})
//     return res.status(200).send({posts, meta: ids})
//   });
// }


module.exports = {createProduct};
