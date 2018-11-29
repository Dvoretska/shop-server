const {expect, assert} = require('chai');
const {calcTotalAmount, calcTotalNumberOfProducts} = require('../services/summary');

describe('Services Summary', () => {
  it('should calculate total amount', () => {
    let initData = [
      {
        attributes: {quantity: 2},
        relations: {product_id: {attributes: {price: 10, discount: 5}}}
      },
      {
        attributes: {quantity: 3},
        relations: {product_id: {attributes: {price: 10}}}
      },
      {
        attributes: {quantity: 4},
        relations: {product_id: {attributes: {price: 10, discount: 3}}}
      }
    ];
    expect(calcTotalAmount(initData)).to.be.equal(52);
  });

  it('should calculate total number of products', () => {
    let initData = [
      {
        attributes: {quantity: 10}
      },
      {
        attributes: {quantity: 20}
      },
      {
        attributes: {quantity: 30}
      }
    ];
    expect(calcTotalNumberOfProducts(initData)).to.be.equal(60);
  });
});
