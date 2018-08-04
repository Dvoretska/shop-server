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
const multer = require('multer');
const busboy = require('connect-busboy');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

db.plugin(securePassword);

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
app.use(busboy());
app.use(upload);
app.use(express.static('public'))

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
        email: result.attributes.email,
        image: result.attributes.image,
        role: result.relations.role_id.attributes.role
      });
    }).catch(err => {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    })
  });
});

app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Role.forge().fetchAll().then(roles => {
    const role = roles.filter((item) => {
      return item.id == req.user.attributes.role_id
    });
    if(role[0].attributes.role == 'user' ) {
      return res.status(403).send('You have no rights for this action.');
    }
    User.forge().fetchAll({withRelated: ['role_id']}).then(users => {
      if(!users) {
        return res.status(404).send('Not Found');
      }
      return res.status(200).send({results: users, meta: roles})
    });
  });
});

app.post('/update', passport.authenticate('jwt', {session: false}), function(req, res) {
  Role.forge().fetchAll().then(roles => {
    const userEmail = req.body.email;
    User.forge({email: userEmail}).fetch().then(function (user) {
      const requestRole = roles.filter((role) => {
        return role.id == req.user.attributes.role_id
      })[0].attributes.role;
      const userRole = roles.filter((role) => {
        return role.id == user.attributes.role_id
      })[0].attributes.role;
      if (requestRole == 'user' || (requestRole == 'premium' && userRole != 'user')) {
        return res.status(403).send({rights: 'You have no rights for this action.'});
      }
      if (req.fileValidationError) {
        return res.status(400).send({image: req.fileValidationError});
      }
      if (req.file) {
        upload(req, res, (err) => {
          if (err) {
            return res.send({success: false});
          } else {
            fs.unlink(`public/${user.get('image')}`, () => {
            });
            User.where({email: userEmail})
              .save({image: req.file.filename}, {patch: true});
          }
        })
      }
      if (req.body.newPassword) {
        if (req.body.newPassword.length < 7) {
          return res.status(400).send({password: 'Password length should me more than 6 characters'})
        } else {
          bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
            User.where({email: userEmail})
              .save({password_digest: hash}, {patch: true});
          });
        }
      }
      if (req.body.selectedRole) {
        Role.forge({role: req.body.selectedRole}).fetch().then((role) => {
          User.where({email: userEmail})
            .save({role_id: role.id}, {patch: true});
        })
      }
      const imageResponse = req.file ? {image: req.file.filename} : {success: 'ok'};
      return res.status(200).send(imageResponse)
    });
  });
});

app.post('/profile', passport.authenticate('jwt', {session: false}), function(req, res) {
    const userEmail = req.user.attributes.email;
    if (req.fileValidationError) {
      return res.status(400).send({image: req.fileValidationError});
    }
    if (req.file) {
      User.forge({email: userEmail}).fetch().then(function (model) {
        upload(req, res, (err) => {
          if (err) {
            return res.send({success: false});
          } else {
            fs.unlink(`public/${model.get('image')}`, () => {
            });
            User.where({email: userEmail})
              .save({image: req.file.filename}, {patch: true});
          }
        })
      })
    }
    if (req.body.newPassword) {
      if (req.body.newPassword.length < 7) {
        return res.status(400).send({password: 'Password length should me more than 6 characters'})
      } else {
        bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
          User.where({email: userEmail})
            .save({password_digest: hash}, {patch: true});
        });
      }
    }
    const imageResponse = req.file ? {image: req.file.filename} : {};
    return res.status(200).send(imageResponse);
});

app.delete('/delete', passport.authenticate('jwt', {session: false}), (req, res) => {
  Role.forge().fetchAll().then(roles => {
    const requestRole = roles.filter((role) => {
      return role.id == req.user.attributes.role_id
    })[0].attributes.role;
    if (requestRole !== 'admin' || req.body.email == req.user.attributes.email) {
      return res.status(403).send('You have no rights for this action.');
    }
    User.where({email: req.body.email}).destroy().then(() => {
      return res.status(200).send({success: 'ok'})
    }).catch((err) => {
      return res.status(404).send({err})
    });
  })
});

app.post('/create', passport.authenticate('jwt', {session: false}), function(req, res) {
  if(req.body.password.length < 7) {
     return res.status(400).send({password: 'Password length should me more than 6 characters'})
  }
  Role.forge().fetchAll().then(roles => {
    const requestRole = roles.filter((role) => {
      return role.id == req.user.attributes.role_id
    })[0].attributes.role;
    if (requestRole !== 'admin') {
      return res.status(403).send('You have no rights for this action.');
    }

    const userId = roles.filter((role) => {
      return role.attributes.role == req.body.userRole
    })[0].attributes.id;

    const user = new User({
      email: req.body.email,
      password: req.body.password,
      role_id: userId
    });
    user.save().then(() => {
      User.where({email: req.body.email}).fetch({withRelated: ['role_id']}).then(user => {
        return res.status(200).send({result: user})
      });
    })
    .catch(err => {
      return res.status(400).send(ERROR_MAPPING[err.code] || err)
    })
  })
});

const PORT =  3000;
app.listen(PORT);