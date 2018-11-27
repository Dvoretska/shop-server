// process.env.NODE_ENV = 'test';
//
// const chai = require('chai');
// const expect = chai.expect;
// const assert = chai.assert;
// const should = chai.should();
// const chaiHttp = require('chai-http');
// const app = require("../").app;
// const server = require("../").server;
// const jwt = require('jsonwebtoken');
// const knexDb = require('../knex.js');
// // const { cleanExceptDefaultUser  } = require("./utils.js");
// const {User} = require('../accounts/models');
// chai.use(chaiHttp);
// var mockDb = require('mock-knex');
//
//
// var tracker = require('mock-knex').getTracker();
//
// describe('Test DAO library with mock-knex', () => {
//   tracker.install();
//   describe('When calling userService.findAll', () => {
//     before((done) => {
//       mockDb.mock(knexDb);
//       tracker.on('query', (query) => {
//         console.log(query)
//         const results = [
//           {
//             id: 1,
//             email: 'test1@mail.com',
//             password: '12345678'
//           },
//           {
//             id: 2,
//             email: 'test2@mail.com',
//             password: '12345678'
//           },
//           {
//             id: 3,
//             email: 'test3@mail.com',
//             password: '12345678'
//           }
//         ];
//         query.response(results);
//       });
//       done();
//     });
//
//     after((done) => {
//       mockDb.unmock(knexDb);
//       done();
//     });
//
//
//   const newUser = {email: 'test-new@techbrij.com', password: 'test34554'};
//
//   function createNewUser(done) {
//
//   };
//
//   // it('should create user', (done) => {
//   //   createNewUser(done);
//   // });
//
//   it('should create new user', (done) => {
//     chai.request(server)
//         .post('/register')
//         .send(newUser)
//         .end(function(err,res){
//           res.should.have.status(201);
//           res.body.token.should.not.be.empty;
//           done();
//         });
//   });
//
//   it('should login', async (done) => {
//     chai.request(server)
//     .post('/login')
//     .send(newUser)
//     .end(function(err,res){
//       res.should.have.status(200);
//       res.body.token.should.not.be.empty;
//       done();
//     });
//   });
    // it('should save new user', (done) => {
    //   const user = new User({email: 'test-new@techbrij.com', password: 'test34554'})
    //   user.save()
    //     .then((model) => {
    //       const users = model;
    //       expect(model.get('email')).to.equal('test-new@techbrij.com');
    //       tracker.uninstall();
    //       done();
    //     });
    // });

    // it('should login a user', (done) => {
    //   User.forge({ id : 1 }).fetch()
    //     .then((model) => {
    //       // expect(model.get('id')).to.equal(1);
    //       // expect(model.get('email')).to.equal('test1@mail.com');
    //       tracker.uninstall();
    //       done();
    //     });
    // });
//   });
// });

// const newUser = { email: "test-new@techbrij.com", password: "test34554" };
//
// describe('Auth APIs', () => {
//
//   before((done) => {
//     // knex.raw('DROP TABLE IF EXISTS users CASCADE;');
//     knex.raw('CREATE TABLE users;');
//     done();
//   });
//
//   after((done) => {
//     // knex.raw('DROP TABLE IF EXISTS users CASCADE;');
//     done();
//   });
//
//
//   it('should create user', (done) => {
//     chai.request(server)
//     .post('/register')
//     .send(newUser)
//     .end(function(err,res){
//       res.should.have.status(201);
//       res.body.token.should.not.be.empty;
//       done();
//     });
//   });
//
//   it('should login', (done) => {
//     chai.request(server)
//     .post('/login')
//     .send(newUser)
//     .end(function(err,res){
//       res.should.have.status(200);
//       res.body.token.should.not.be.empty;
//       done();
//     });
//   });
//
//   it('should not login with the right user but wrong password', (done) => {
//     chai.request(server)
//     .post('/login')
//     .send({ email: newUser.email, password: 'random123' })
//     .end(function(err,res){
//       res.should.have.status(400);
//       expect(res.body.non_field_error,).to.equals('Incorrect email or password');
//       done();
//     });
//   });
//
// });

process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const request = require('request');
const chai = require('chai');
const should = chai.should();


describe('GET users', () => {
  beforeEach(() => {
    this.get = sinon.stub(request, 'get');
  });
  afterEach(() => {
    request.restore();
  });
  it('should return all users', (done) => {
    request.get('/users', (err, res, body) => {
      // there should be a 200 status code
      console.log(res)
      res.status.should.eql(200);
      // the response should be JSON
      res.headers['content-type'].should.contain('application/json');
      // parse response body
      body = JSON.parse(body);
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      // body.status.should.eql('success');
      // the JSON response body should have a
      // key-value pair of {"data": [3 movie objects]}
      body.data.length.should.eql(3);
      // the first object in the data array should
      // have the right keys
      // body.data[0].should.include.keys(
      //     'id', 'name', 'genre', 'rating', 'explicit'
      // );
      // the first object should have the right value for name
      // body.data[0].name.should.eql('The Land Before Time');
      done();
    });
  });
});
