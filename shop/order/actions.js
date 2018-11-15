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
        models.Cart.where({user_id: req.user.attributes.id}).destroy().then(() => {
          return res.status(201).send({order_number: result[0].attributes.order_number})
        }).catch(err => {
          return res.status(400).send(err)
        })
      })
    })
  })
}

function getOrder(req, res) {
  Order.where({order_number: req.params.id}).fetchAll({withRelated: ['product_id', 'order_person_id']}).then(orders => {
    models.Category.forge().fetchAll().then(categories => {
      let ordersArr = [];
      let info = {};
      let person;
      orders.map(order => {
        person = order.relations.order_person_id.attributes;
        info['created'] = order.attributes.created;
        info['order_number'] = order.attributes.order_number;
        let category = categories.find(o => +order.relations.product_id.attributes.category_id === +o.id);
        let amount = 0;
        let discount = order.relations.product_id.attributes.discount;
        let price = order.relations.product_id.attributes.price;
        let quantity = order.attributes.quantity;
        if(discount) {
          amount = discount * quantity;
        } else {
          amount = price * quantity;
        }
        let updatedOrder = {
          quantity: order.attributes.quantity,
          size: order.attributes.size,
          category: category.attributes.name,
          brand: order.relations.product_id.attributes.brand,
          amount: amount};
        ordersArr.push(updatedOrder)
      });
      let totalAmount = 0;
      for (let i = 0; i < ordersArr.length; i++) {
        totalAmount += ordersArr[i].amount;
      }
      return res.status(201).send({order_info: info, order: ordersArr, order_person: person, totalAmount})
    }).catch(err => {
      return res.status(400).send(err)
    })
  })
}



module.exports = {createOrder, getOrder};
