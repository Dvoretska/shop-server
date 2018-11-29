process.env.NODE_ENV = 'test';

const app = require('../index');
const knex = require('../knex');
const chai = require('chai');
const {expect, assert} = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const knexCleaner = require('knex-cleaner');
const bcrypt = require('bcrypt');

describe('POST /register', () => {
  const options = {
    mode: 'delete',
    ignoreTables: ['roles']
  };

  let token;

  before((done) => {
    knexCleaner.clean(knex, options).then(function() {
      done();
    });
  });

  // after((done) => {
  //   knexCleaner.clean(knex, options).then(function() {
  //     done();
  //   });
  // });

  it('should register a new user', (done) => {
    chai.request(app)
      .post('/register')
      .send({
        role: 'premium',
        email: 'test1@test.com',
        password: 'johnson123'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.body.should.include.keys('token', 'role', 'email');
        token = res.body['token'];
        console.log(res.body)
        done();
      });
  });

  it('should login a user', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'test1@test.com',
        password: 'johnson123'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.should.include.keys('token');
        done();
      });
  });

  it('should not login with the right user but wrong password', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'vasya@test.com',
        password: 'johnson123'
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.include.keys('non_field_error');
        res.body['non_field_error'].should.equal('Incorrect email or password');
        res.body.should.not.include.keys('token');
        done();
      });
  });

  it('should return users', (done) => {
    chai.request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });
});

