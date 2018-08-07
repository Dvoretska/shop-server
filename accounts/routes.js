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
const services = require('./services');
const bcrypt = require('bcrypt');
const fs = require('fs');
const actions = require('./actions');

const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};
const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

const router = require('express').Router();

// router.post('/register', (req, res) => {
  // services.checkIfPasswordValid(req.body.password)
  // if(services.isPasswordValid(req.body.password)) {
  //   return res.status(400).send({password: passwordError})
  // }
//   models.Role.forge({role: req.body.role || 'user'}).fetch().then(role => {
//     const user = new models.User({
//       email: req.body.email,
//       password: req.body.password
//     });

//     user.save().then((result) => {
//       const payload = {id: result.id};
//       const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
//       return res.status(201).send({
//         email: user.attributes.email,
//         token: token,
//         role: role.attributes.role
//       });
//     }).catch(err => {
//       return res.status(400).send(ERROR_MAPPING[err.code] || err)
//     })
//   })
// });

router.post('/register', services.checkIfPasswordValid, actions.register);

router.post('/login', actions.login);

router.get('/users', passport.authenticate('jwt', {session: false}), services.checkRole(['admin', 'premium']), actions.getUsersList);

router.post('/profile', passport.authenticate('jwt', {session: false}), function(req, res) {
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

router.post('/create', passport.authenticate('jwt', {session: false}), services.checkRole(['admin']), actions.createUser);

router.delete('/delete', passport.authenticate('jwt', {session: false}), services.checkRole(['admin']), actions.deleteUser);

router.post('/update', passport.authenticate('jwt', {session: false}), function(req, res) {
  models.Role.forge().fetchAll().then(roles => {
    const userEmail = req.body.email;
    models.User.forge({email: userEmail}).fetch().then(function (user) {
      const requestRole = services.getRole(roles, req.user.attributes.role_id);
      const userRole = services.getRole(roles, user.attributes.role_id);
      if (services.isUser(requestRole) || (requestRole == 'premium' && !services.isUser(userRole))) {
        return res.status(403).send({rights: accessDenied});
      }
      if (req.fileValidationError) {
        return res.status(400).send({image: req.fileValidationError});
      }
      if (req.file) {
        services.upload(req, res, (err) => {
          if (err) {
            return res.send({success: false});
          } else {
            fs.unlink(`public/${user.get('image')}`, () => {
            });
            models.User.where({email: userEmail})
              .save({image: req.file.filename}, {patch: true});
          }
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
      if (req.body.selectedRole) {
        models.Role.forge({role: req.body.selectedRole}).fetch().then((role) => {
          models.User.where({email: userEmail})
            .save({role_id: role.id}, {patch: true});
        })
      }
      const imageResponse = req.file ? {image: req.file.filename} : {success: 'ok'};
      return res.status(200).send(imageResponse)
    });
  });
});

module.exports = router;