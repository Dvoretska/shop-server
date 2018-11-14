const models = require('../models');
const {OrderPerson, Order, Orders} = require('./models');


function createOrder(req, res) {
  const orderPerson = new OrderPerson({
    phone: req.body.phone,
    post_code: req.body.post_code,
    country: req.body.country,
    city: req.body.city,
    first_name: req.body.first_name,
    surname: req.body.surname,
    comment: req.body.comment,
    user_id: req.user.attributes.id
  });
  orderPerson.save().then((person) => {
    models.Cart.where({user_id: req.user.attributes.id}).fetchAll({ columns: ['quantity', 'size', 'product_id'], withRelated: ['product_id'] }).then(carts => {
      let products = [];
      carts.map(cart => {
        let cartProduct = {};
        cartProduct['quantity'] = cart.attributes.quantity;
        cartProduct['size'] = cart.attributes.size;
        cartProduct['product_id'] = cart.attributes.product_id;
        cartProduct['created'] = new Date();
        cartProduct['order_number'] = `${new Date().toISOString().slice(0,10).replace(/-/g,"")}${person.attributes.id}`;
        cartProduct['order_person_id'] = person.attributes.id;
        products.push(cartProduct)
      });
      let orders = Orders.forge(products);
      orders.invokeThen('save').then((result) => {
        return res.status(201).send({order_number: result[0].attributes.order_number})
      }).catch(err => {
        return res.status(400).send(err)
      })
    })
  })
}

function getOrder(req, res) {
  Order.where({order_number: req.params.id}).fetchAll({withRelated: ['product_id']}).then(orders => {
    models.Category.forge().fetchAll().then(categories => {
      let ordersArr = [];
      orders.map(order => {
        let category = categories.find(o => order.relations.product_id.attributes.category_id == o.id);
        let updatedOrder = {...order.attributes, category: category.attributes.name, brand: order.relations.product_id.attributes.brand}
        ordersArr.push(updatedOrder)
      });
      return res.status(201).send({orders: ordersArr})
    }).catch(err => {
      return res.status(400).send(err)
    })
  })
}



module.exports = {createOrder, getOrder};
