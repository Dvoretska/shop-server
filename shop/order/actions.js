const {OrderPerson, Order, Orders, OrderItems} = require('./models');
const {Cart} = require('../cart/models');
const {Category} = require('../categories/models');


function createOrder(req, res) {
  const orderPerson = new OrderPerson({
    phone: req.body.phone,
    post_code: req.body.post_code,
    country: req.body.country,
    city: req.body.city,
    first_name: req.body.first_name,
    surname: req.body.surname,
    comment: req.body.comment,
    user_id: req.user.id
  });
  orderPerson.save().then((person) => {
    Cart.where({user_id: req.user.attributes.id}).fetchAll({ columns: ['quantity', 'size', 'product_id'], withRelated: ['product_id'] }).then(carts => {
      let order_items = [];
      carts.map(cart => {
        let order_item = {};
        let quantity = cart.attributes.quantity;
        order_item['quantity'] = quantity;
        order_item['size'] = cart.attributes.size;
        order_item['product_id'] = cart.attributes.product_id;
        let discount = cart.relations.product_id.attributes.discount;
        let price = cart.relations.product_id.attributes.price;
        let amount = 0;
        if(discount) {
          amount = discount * quantity;
        } else {
          amount = price * quantity;
        }
        order_item['amount'] = amount;
        order_items.push(order_item)
      });
      let items = OrderItems.forge(order_items);
      items.invokeThen('save').then((order_items) => {
        let orderArr = [];
        let total_amount = order_items.reduce((prev, current) => {return prev + current.attributes['amount']}, 0);
        order_items.map((order_item) => {
          let order = {};
          order['created'] =  new Date();
          order['order_person_id'] = person.attributes.id;
          order['order_number'] = `${new Date().toISOString().slice(0,10).replace(/-/g,"")}${person.attributes.id}`;
          order['user_id'] = req.user.id;
          order['order_item_id'] = order_item.attributes.id;
          order['total_amount'] = total_amount;
          orderArr.push(order);
        });
        let orders = Orders.forge(orderArr);
        orders.invokeThen('save').then((order) => {
          Cart.where({user_id: req.user.attributes.id}).destroy().then(() => {
            return res.status(201).send({order_number: order[0].attributes.order_number})
          }).catch(err => {
            return res.status(400).send(err)
          })
        })
      })
    })
  })
}

function getOrder(req, res) {
  Order.where({order_number: req.params.id}).fetchAll({withRelated: ['order_item_id.product_id', 'order_person_id', 'user_id']}).then(orders => {
      Category.forge().fetchAll().then(categories => {
        let ordersArr = [];
        let info = {};
        let person = {};
        orders.map(order => {
          person['data'] = order.relations.order_person_id.attributes;
          person['email'] = order.relations.user_id.attributes.email;
          info['created'] = order.attributes.created;
          info['order_number'] = order.attributes.order_number;
          info['total_amount'] = order.attributes.total_amount;
          let category = categories.find(o => +order.relations.order_item_id.relations.product_id.attributes.category_id === +o.id);
          let updatedOrder = {
            quantity: order.relations.order_item_id.attributes.quantity,
            size: order.relations.order_item_id.attributes.size,
            category: category.attributes.name,
            brand: order.relations.order_item_id.relations.product_id.attributes.brand,
            amount: order.relations.order_item_id.attributes.amount};
          ordersArr.push(updatedOrder)
        });
        return res.status(201).send({order_info: info, order: ordersArr, order_person: person})
      }).catch(err => {
        return res.status(400).send(err)
      })
  })
}

function getOrders(req, res) {
  Order.where({user_id: req.user.id}).query('orderBy', 'created', 'desc').fetchAll({columns: ['total_amount', 'order_number', 'created', 'user_id']}).then(orders => {
    let ordersArr = [];
    orders.map((order) => {
      let found = ordersArr.some((el) => {
        return +el.attributes.order_number === +order.attributes.order_number;
      });
      if (!found) { ordersArr.push(order); }
    });
    return res.status(201).send({orders: ordersArr})
  }).catch(err => {
    return res.status(400).send(err)
  })
}


module.exports = {createOrder, getOrder, getOrders};
