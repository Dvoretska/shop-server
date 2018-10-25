function calcTotalAmount(result) {
  let cartArr = [];
  let totalAmount = 0;
  result.map((item) => {
    let cart = {};
    cart['quantity'] = item.attributes.quantity;
    cart['price'] = item.relations.product_id.attributes.price;
    if(item.relations.product_id.attributes.discount) {
      cart['discount'] = item.relations.product_id.attributes.discount;
      cart['amount'] = cart['quantity'] * cart['discount'];
    } else {
      cart['amount'] = cart['quantity'] * cart['price'];
    }
    cartArr.push(cart);
  });
  for (let i = 0; i < cartArr.length; i++) {
    totalAmount += cartArr[i].amount;
  }
  return totalAmount;
}

module.exports = {calcTotalAmount};
