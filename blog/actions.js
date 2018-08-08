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
const models = require('../shared/models');
const services = require('./services');
const sharedServices = require('../shared/shared-services')
const bcrypt = require('bcrypt');
const fs = require('fs');

const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};


function createPost(req, res) {
    const post = new models.Post({
        title: req.body.title,
        content: req.body.text,
        image: req.file.filename,
        user_id: req.user.attributes.id
    });
    models.Post.forge().fetch({withRelated: ['user_id']}).then((user)=> {
        post.save().then(() => {
            return res.status(201).send({
                post, user: user.relations.user_id.attributes
            });
        }).catch(err => {
            return res.status(400).send(err)
        })
    })
}

function getPosts(req, res) {
    models.Post.forge().fetchAll({withRelated: ['user_id']}).then(posts => {
        if(!posts) {
            return res.status(404).send('Not Found');
        }
        return res.status(200).send({results: posts})
    });
}
    
module.exports = {createPost, getPosts};