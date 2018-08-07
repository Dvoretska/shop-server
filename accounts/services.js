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
const multer = require('multer');
const path = require('path');

const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

function isPasswordValid(password) {
  return password.length < 7;
}

function isUser(role) {
  return role == 'user';
}

function isPremium(role) {
  return role == 'premium';
}

function isAdmin(role) {
  return role == 'admin';
}

function getRole(roles, roleId) {
  return roles.filter((role) => {return role.id == roleId})[0].attributes.role
}
function getRoleId(userRole, callback) {
  models.Role.forge().fetchAll().then(roles => {
    callback(roles.filter((role) => {return role.attributes.role == userRole})[0].attributes.id);
  })
}

function allowedRoles(acceptRoles) {
  return function(req, res, next) {
    models.Role.forge().fetchAll().then(roles => {
      const requestRole = getRole(roles, req.user.attributes.role_id);
      if (acceptRoles.indexOf(requestRole) == -1) {
        return res.status(403).send(accessDenied);
      } else {
        next();
      }
    })
  }
}

function limitedAllowedRoles(acceptRoles) {
  return function(req, res, next) {
    models.Role.forge().fetchAll().then(roles => {
      const userEmail = req.body.email;
      models.User.forge({email: userEmail}).fetch().then(function (user) {
        const requestRole = getRole(roles, req.user.attributes.role_id);
        const userRole = getRole(roles, user.attributes.role_id);
        if (isAdmin(requestRole) || acceptRoles.indexOf(requestRole) !== -1 && isUser(userRole)) {
          next();
        } else {
          return res.status(403).send({rights: accessDenied});
        }
      })
    })
  }
};

function checkIfPasswordValid(req, res, next) {
  if(req.body.password.length < 7) {
    return res.status(400).send({password: passwordError});
  } else {
    next();
  }
}

function checkIfImageValid(req, res, next) {
  if(req.fileValidationError) {
    return res.status(400).send({image: req.fileValidationError});
  } else {
    next();
  }
}

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({storage: storage, fileFilter: function(req, file, callback) {
  let ext = path.extname(file.originalname);
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
    req.fileValidationError = 'Only images are allowed';
    return callback(null, false, req.fileValidationError)
  }
  callback(null, true)
  }
}).single('file');

module.exports = {isPasswordValid,
                  isUser,
                  isPremium,
                  isAdmin,
                  getRole,
                  upload,
                  getRoleId,
                  allowedRoles,
                  checkIfPasswordValid,
                  checkIfImageValid,
                  limitedAllowedRoles};