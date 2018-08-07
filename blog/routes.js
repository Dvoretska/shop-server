const app = module.exports = require('express')();
const passport = require('passport');
const parser = require('body-parser');
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);
const jwt = require('jsonwebtoken');
const models = require('./models');
const services = require('../accounts/services');
const bcrypt = require('bcrypt');
const fs = require('fs');

const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};

app.post('/register', (req, res) => {
  if(services.isPasswordValid(req.body.password)) {
    return res.status(400).send({password: passwordError})
  }
  models.Role.forge({role: req.body.role || 'user'}).fetch().then(role => {
    const user = new models.User({
      email: req.body.email,
      password: req.body.password
    });

    user.save().then((result) => {
      const payload = {id: result.id};
      const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
      return res.status(201).send({
        email: user.attributes.email,
        token: token,
        role: role.attributes.role
      });
    }).catch(err => {
      return res.status(400).send(ERROR_MAPPING[err.code] || err)
    })
  })
});


app.post('/profile', passport.authenticate('jwt', {session: false}), function(req, res) {
    const userEmail = req.user.attributes.email;
    if (req.fileValidationError) {
      return res.status(400).send({image: req.fileValidationError});
    }
    if (req.file) {
      models.User.forge({email: userEmail}).fetch().then(function (model) {
        services.upload(req, res, (err) => {
          if (err) {
            return res.send({success: false});
          } else {
            fs.unlink(`public/${model.get('image')}`, () => {
            });
            models.User.where({email: userEmail})
              .save({image: req.file.filename}, {patch: true});
          }
        })
      })
    }
    if (req.body.newPassword) {
      if (services.isPasswordValid(req.body.newPassword)) {
        return res.status(400).send({password: passwordError})
      } else {
        bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
          models.User.where({email: userEmail})
            .save({password_digest: hash}, {patch: true});
        });
      }
    }
    const imageResponse = req.file ? {image: req.file.filename} : {};
    return res.status(200).send(imageResponse);
});

const routes = [
  app.post('/create', passport.authenticate('jwt', {session: false}), function(req, res) {
  if(services.isPasswordValid(req.body.password)) {
     return res.status(400).send({password: passwordError})
  }
  models.Role.forge().fetchAll().then(roles => {

    const requestRole = services.getRole(roles, req.user.attributes.role_id);

    if (!services.isAdmin(requestRole)) {
      return res.status(403).send(accessDenied);
    }

    const userId = services.getRole(roles, req.body.userRole);

    const user = new models.User({
      email: req.body.email,
      password: req.body.password,
      role_id: userId
    });
    user.save().then(() => {
      models.User.where({email: req.body.email}).fetch({withRelated: ['role_id']}).then(user => {
        return res.status(200).send({result: user})
      });
    })
    .catch(err => {
      return res.status(400).send(ERROR_MAPPING[err.code] || err)
      })
    })
  })
];



module.exports = routes;