const {Customer, Order, OrderItems, OrderItem} = require('./models');
const {Cart} = require('../cart/models');
const {Category} = require('../categories/models');
const summary = require('../../services/summary');

async function createOrder(req, res, next) {
  try {
    let cart_items = await Cart.where({user_id: req.user.id, is_ordered: false})
      .fetchAll({ withRelated: ['product_id.subcategory.category', 'size_id'] });
    let total_amount = summary.calcTotalAmount(cart_items);
    const order = new Order({
      order_number: `${new Date().toISOString().slice(0,10).replace(/-/g,"")}${req.user.id}`,
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
      order_item['quantity'] = cart_item.attributes.quantity;
      order_item['size'] = cart_item.relations.size_id.attributes.name;
      order_item['category'] = cart_item.relations.product_id.relations.subcategory.relations.category.attributes.name;
      order_item['subcategory'] = cart_item.relations.product_id.relations.subcategory.attributes.name;
      order_item['brand'] = cart_item.relations.product_id.attributes.brand;
      order_item['order_id'] = saved_order.attributes.id;
      order_items.push(order_item)
    });
    let items = await OrderItems.forge(order_items);
    await items.invokeThen('save');
    let promises = [];
    cart_items.map(() => {
      let promise = Cart.where({
        user_id: req.user.id
      }).save({is_ordered: true}, {patch: true});
      promises.push(promise)
    });
    Promise.all(promises).then(()=> {
      return res.status(201).send({order_number: saved_order.attributes.order_number});
    });
  }
  catch(err) {
     return next(err);
  }
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
