const app = module.exports = require('express')();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
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
const bcrypt = require('bcrypt');

const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

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

const fileFilter = function(req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        req.fileValidationError = 'Only images are allowed';
        return callback(null, false, req.fileValidationError)
    }
    callback(null, true)
};

let upload = multer({storage: storage, fileFilter: fileFilter}).single('file');

function getRole(roles, roleId) {
    return roles.filter((role) => {return role.id == roleId})[0].attributes.role
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


const isAuthenticated = passport.authenticate('jwt', {session: false});

module.exports = {fileFilter, isAuthenticated, allowedRoles, getRole, checkIfImageValid, upload};