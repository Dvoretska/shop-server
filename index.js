const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = new express();
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const parser = require('body-parser');
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/project_db'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);
const jwt = require('jsonwebtoken');
const cors = require('cors');

db.plugin(securePassword);


const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};

const Role = db.Model.extend({
  tableName: 'roles',
  hasSecurePassword: true
});

const User = db.Model.extend({
  tableName: 'users',
  hasSecurePassword: true,
  role_id: function() {
      return this.belongsTo(Role, 'role_id');
  },
});


const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

const strategy = new JwtStrategy(opts, (payload, next) => {
  // Get user from db
  User.forge({id: payload.id}).fetch().then(res => {
    next(null, res);
  });
});

passport.use(strategy);
app.use(cors());
app.use(passport.initialize());
app.use(parser.urlencoded({
  extended: false
}));
app.use(parser.json());

app.get('/', (req, res) => {
  res.send('Hello world');
});
app.post('/register', (req, res) => {
  if(req.body.password.length < 7) {
    return res.status(400).send({password: 'Password length should me more than 6 characters'})
  }
  Role.forge({role: req.body.role || 'user'}).fetch().then(role => {
    const user = new User({
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

app.post('/login', (req, res) => {
  User.forge({email: req.body.email}).fetch({withRelated: ['role_id']}).then(result => {
    if(!result) {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    }
    result.authenticate(req.body.password).then(result => {
      const payload = {id: result.id};
      const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
      res.send({
        token,
        user: result.attributes.email,
        role: result.relations.role_id.attributes.role
      });
    }).catch(err => {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    })
  });
});

app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {

  Role.forge({id: req.user.attributes.role_id}).fetch().then(result => {
    if(result.attributes.role === 'user') {
      return res.status(403).send('FORBIDDEN');
    }
    User.forge().fetchAll({withRelated: ['role_id']}).then(result => {
      if(!result) {
        return res.status(404).send('Not Found');
      }
      return res.status(200).send(result)
    });
  });
});
const PORT = 3000;
app.listen(PORT);