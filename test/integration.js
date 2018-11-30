process.env.NODE_ENV = 'test';

const app = require('../index');
const knex = require('../knex');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const knexCleaner = require('knex-cleaner');
const bcrypt = require('bcrypt');

describe('Authorization and users', () => {
  const options = {
    mode: 'delete',
    ignoreTables: ['roles']
  };

  let userToken;
  let adminToken;

  before((done) => {
    knexCleaner.clean(knex, options).then(function() {
      bcrypt.hash('123456', 10, function (err, hash) {
        knex('users').insert([{email: 'test@admin.com', password_digest: hash, 'role_id': 3},
          {email: 'test@premium.com', password_digest: hash, 'role_id': 2}]).then(()=>{
          done();
        });
      });
    });
  });

  after((done) => {
    knexCleaner.clean(knex, options).then(function() {
      done();
    });
  });

  it('should register a new user with default role "user"', (done) => {
    chai.request(app)
      .post('/register')
      .send({
        email: 'test1@test.com',
        password: 'johnson123'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.body.should.include.keys('token', 'role', 'email');
        res.body['role'].should.equal('user');
        done();
      });
  });

  it('should login a user with default role "user"', (done) => {
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
        userToken = res.body['token'];
        done();
      });
  });

  it('should login a user with role "admin', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@admin.com',
        password: '123456'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.should.include.keys('token');
        adminToken = res.body['token'];
        done();
      });
  });

  it('should NOT login with the right user but wrong password', (done) => {
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

  it('should NOT return users if role is "user"', (done) => {
    chai.request(app)
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.status.should.equal(403);
        done();
      });
  });

  it('should return users if role is "admin"', (done) => {
    chai.request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.meta.should.be.an('array').to.have.lengthOf(3);
        res.body.results.should.be.an('array').to.have.lengthOf(3);
        done();
      });
  });

  it('should NOT create a new user if role is "user"', (done) => {
    chai.request(app)
      .post('/create')
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        res.status.should.equal(403);
        done();
      });
  });

  it('should create a new premium user if your role is "admin"', (done) => {
    chai.request(app)
      .post('/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'new@test.com',
        password: 'johnson123',
        userRole: 'premium'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.body.result.role_id.role.should.equal('premium');
        done();
      });
  });

  it('should delete a user if your role is "admin"', (done) => {
    chai.request(app)
      .delete('/delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'new@test.com'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.success.should.equal('ok');
        done();
      });
  });

  it('should NOT delete a user if your role is "user"', (done) => {
    chai.request(app)
      .delete('/delete')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        email: 'test@premium.com'
      })
      .end((err, res) => {
        res.status.should.equal(403);
        done();
      });
  });

  it('should NOT change password in profile if password is invalid', (done) => {
    chai.request(app)
      .post('/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        password: '123'
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body['password'].should.equal('Password length should me more than 6 characters');
        done();
      });
  });

  it('should change password in profile if password is valid', (done) => {
    chai.request(app)
      .post('/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        password: '123qscwdv'
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });

  it('should NOT update profile if your role is "user"', (done) => {
    chai.request(app)
      .post('/update')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        email: 'test1@test.com',
        selectedRole: 'premium',
        password: '123qscwdv'
      })
      .end((err, res) => {
        res.body['rights'].should.equal('You have no rights for this action.');
        res.status.should.equal(403);
        done();
      });
  });

  it('should update profile if your role is "admin"', (done) => {
    chai.request(app)
      .post('/update')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'test1@test.com',
        selectedRole: 'premium',
        password: '123qscwdv'
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });

});

