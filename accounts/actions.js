const jwt = require('jsonwebtoken');
const models = require('./models');
const upload = require('../services/upload');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validation = require('../services/validation');

const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};

function register(req, res) {
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
}

function login(req, res) {
	models.User.forge({email: req.body.email}).fetch({withRelated: ['role_id']}).then(result => {
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
    }).catch(() => {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    })
  })
}

function profile(req, res) {
  const userEmail = req.user.attributes.email;
  if (req.file) {
    models.User.forge({email: userEmail}).fetch().then(function (model) {
        upload(req, res, (err) => {
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
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      models.User.where({email: userEmail})
        .save({password_digest: hash}, {patch: true});
    });
  }
  const imageResponse = req.file ? {image: req.file.filename} : {};
  return res.status(200).send(imageResponse);
}

function getUsersList(req, res) {
	models.Role.forge().fetchAll().then(roles => {
		models.User.forge().fetchAll({withRelated: ['role_id']}).then(users => {
	    if(!users) {
	      return res.status(404).send('Not Found');
	    }
	    return res.status(200).send({results: users, meta: roles})
	  });
	})
}

function update(req, res) {
  const userEmail = req.body.email;
  if (req.file) {
      upload(req, res, (err) => {
      if (err) {
        return res.send({success: false});
      } else {
        models.User.forge({email: userEmail}).fetch().then(function (user) {
          fs.unlink(`public/${user.get('image')}`, () => {
          });
        });
        models.User.where({email: userEmail})
          .save({image: req.file.filename}, {patch: true});
      }
    })
  }
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      models.User.where({email: userEmail})
        .save({password_digest: hash}, {patch: true});
    });
  }
  models.Role.forge().fetchAll().then((roles) => {
    const requestRole = validation.getRole(roles, req.user.attributes.role_id);
    if (validation.isAdmin(requestRole)) {
      for (const role of roles.models) {
        if (role.attributes['role'] == req.body.selectedRole) {
          models.User.where({email: userEmail})
           .save({role_id: role.attributes['id']}, {patch: true});
        }
      }
    }
  });
  const imageResponse = req.file ? {image: req.file.filename} : {success: 'ok'};
  return res.status(200).send(imageResponse);
}

function deleteUser(req, res) {
  models.User.forge({email: req.body.email}).fetch().then(function (user) {
    fs.unlink(`public/${user.get('image')}`, () => {});
    models.User.where({email: req.body.email}).destroy().then(() => {
      return res.status(200).send({success: 'ok'})
    }).catch((err) => {
      return res.status(404).send({err})
    });
  });
}

function createUser(req, res) {
	validation.getRoleId(req.body.userRole, (id) => {
	const user = new models.User({
    email: req.body.email,
    password: req.body.password,
    role_id: id
  });
  user.save().then(() => {
    models.User.where({email: req.body.email}).fetch({withRelated: ['role_id']})
    .then(user => {
	      return res.status(200).send({result: user})
	    });
	  })
	  .catch(err => {
	    return res.status(400).send(ERROR_MAPPING[err.code] || err)
	  })
	})
}

    
module.exports = {deleteUser, createUser, getUsersList, login, register, profile, update};
