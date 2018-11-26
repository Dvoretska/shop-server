process.env.NODE_ENV = 'test';

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
const should = chai.should();
var chaiHttp = require('chai-http');
var app = require("../").app;
var server = require("../").server;
const jwt = require('jsonwebtoken');
const knex = require('../knex.js');
// const { cleanExceptDefaultUser  } = require("./utils.js");
const {User} = require('../accounts/models');
chai.use(chaiHttp);



// describe('POST /add-to-wishlist', function() {
//   var token;
//
//   before(function (done) {
//     chai.request(app)
//         .post('/login')
//         .send({
//           email: 'test@example.com',
//           password: 'secret123'
//         })
//         .end(function(err,res){
//           res.should.have.status(200);
//           const payload = {id: res.id};
//           token = jwt.sign(payload, process.env.SECRET_OR_KEY);
//           done();
//         });
//   });
//   it('should add a product to wishlist', function(done) {
//     chai.request(app)
//         .post('/add-to-wishlist')
//         .set('authorization', 'Bearer ' + token)
//         .send({user_id: 1, product_id: 2})
//         .end(function (err, res) {
//           expect(err).to.be.null;
//           expect(res).to.have.status(201);
//           done();
//         });
//   })
// })

describe('POST /login', () => {

  after(function (done) {
    server.close();
    done();
  });

  const newUser = { email: "test-new@techbrij.com", password: "test34554" };
  it("should create user", (done) => {
    User.where({email: newUser.email}).destroy();
      chai.request(server).post('/register')
        .send(newUser)
        .end(function(err,res){
          res.should.have.status(201);
          res.body.token.should.not.be.empty;
          done();
        });
    });

  it('should login', (done) => {
    chai.request(server)
    .post('/login')
      .send(newUser)
      .end(function(err,res){
        res.should.have.status(200);
        res.body.token.should.not.be.empty;
        done();
      });
    });

  it("should not login with the right user but wrong password", (done) => {
    chai.request(server).post('/login')
      .send({ email: newUser.email, password: "random123" })
      .end(function(err,res){
        res.should.have.status(400);
        expect(res.body.non_field_error,).to.equal('Incorrect email or password');
        done();
      });
  });


});


