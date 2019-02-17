const {Order, OrderItems, OrderItem} = require('./models');
const {Cart} = require('../cart/models');
const {Category} = require('../categories/models');
const summary = require('../../services/summary');
const knex = require('../../knex');

async function createOrder(req, res, next) {
  try {
    let cart_items = await Cart.where({user_id: req.user.id, is_ordered: false})
      .fetchAll({ withRelated: ['product_id.subcategory.category', 'size_id'] });
    let total_amount = summary.calcTotalAmount(cart_items);
    const order = new Order({
      order_number: `${new Date().getTime()}${req.user.id}`,
      phone: req.body.phone,
      post_code: req.body.postCode,
      country: req.body.country,
      city: req.body.city,
      first_name: req.body.firstName,
      surname: req.body.surname,
      comment: req.body.comment,
      total_amount: total_amount,
      user_id: req.user.id
    });
    let saved_order = await order.save();
    let order_items = [];
    cart_items.map(cart_item => {
      let order_item = {};
      let quantity = cart_item.attributes.quantity;
      order_item['quantity'] = quantity;
      order_item['size'] = cart_item.relations.size_id.attributes.name;
      order_item['category'] = cart_item.relations.product_id.relations.subcategory.relations.category.attributes.name;
      order_item['subcategory'] = cart_item.relations.product_id.relations.subcategory.attributes.name;
      order_item['brand'] = cart_item.relations.product_id.attributes.brand;
      order_item['order_id'] = saved_order.attributes.id;
      let discount = cart_item.relations.product_id.attributes.discount;
      let price = cart_item.relations.product_id.attributes.price;
      let amount = 0;
      if(discount) {
        amount = discount * quantity;
      } else {
        amount = price * quantity;
      }
      order_item['amount'] = amount;
      order_items.push(order_item);
    });
    let items = await OrderItems.forge(order_items);
    await items.invokeThen('save');
    await Cart.where({user_id: req.user.attributes.id}).destroy();
    return res.status(201).send({order_number: saved_order.attributes.order_number});
  }
  catch(err) {
     return next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    let order = await knex.raw(`SELECT array_to_json(array_agg(json_build_object('brand', i.brand, 'category', i.category, 
    'subcategory', i.subcategory, 'quantity', i.quantity, 'size', i.size, 'amount', i.amount))) as products, o.*
    FROM orders o 
    JOIN order_items i ON o.id = i.order_id
    WHERE o.order_number = '${req.params.id}' AND o.user_id = ${req.user.id}
    GROUP BY o.id`);
    return res.status(201).send({order: order.rows[0]});
  }
  catch(err) {
     return next(err);
  }
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
