const jwt = require('jsonwebtoken');
const models = require('./models');
const multipleUpload = require('../services/multipleUpload');
const deleteImage = require('../services/deleteImage');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validation = require('../services/validation');

const ERROR_MAPPING = {
  '23505': {email: 'Email already exists'},
  'login_error': {non_field_error: 'Incorrect email or password'}
};

function register(req, res) {
  const user = new models.User({
    email: req.body.email,
    password: req.body.password
  });
  user.save().then((result) => {
    const payload = {id: result.id};
    const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
    return res.status(201).send({user: {email: user.attributes.email,role: 'user'}, token});
  }).catch(err => {
    return res.status(400).send(ERROR_MAPPING[err.code] || err)
  })
}

function login(req, res) {
	models.User.where({email: req.body.email}).fetch({withRelated: ['role_id']}).then(result => {
    if(!result) {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    }
    result.authenticate(req.body.password).then(result => {
      const payload = {id: result.id};
      const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
      res.status(200).send({
        token,
        user: {email: result.attributes.email, image: result.attributes.image, role: result.relations.role_id.attributes.role}
      });
    }).catch((err) => {
      return res.status(400).send(ERROR_MAPPING['login_error']);
    })
  }).catch(err => {
    return res.status(400).send(err);
  })
}

function tokenVerify(req, res, next) {
  models.User.where({id: req.user.id}).fetch({withRelated: ['role_id']}).then(result => {
    const user = {email: result.attributes.email, image: result.attributes.image, role: result.relations.role_id.attributes.role};
    return res.status(200).send({user});
  }).catch(err => {
    return next(err);
  })
}

function createUser(req, res) {
  models.Role.forge({role: req.body.userRole}).fetch().then(role => {
    const user = new models.User({
      email: req.body.email,
      password: req.body.password,
      role_id: role.attributes.id
    });
    user.save().then(() => {
      models.User.where({email: req.body.email}).fetch({withRelated: ['role_id']})
        .then(user => {
          return res.status(201).send({result: user})
        })
        .catch(err => {
          return res.status(400).send(ERROR_MAPPING[err.code] || err)
        })
    })
  }).catch(err => {
    return res.status(400).send(err);
  })
}

function profile(req, res, next) {
  const userEmail = req.user.attributes.email;
  var password = req.body.password;
  if (req.files && req.files.length) {
    var filename = req.files[0].location;
    models.User.where({email: userEmail}).fetch().then((user) => {
      multipleUpload(req, res, (err) => {
        if (err) {
          return next(err);
        } else {
          if(user.attributes.image) {
            let prevImage = user.attributes.image.split('/').slice(-1)[0];
            deleteImage(prevImage, function(err) {
              if (err) {
                return next(err);
              } else {
                models.User.where({email: userEmail}).save({image: filename}, {patch: true}).then(() =>{
                  if(password) {
                    return;
                  } else {
                    res.status(200).send({image: filename});
                  }
                });
              }
            });
          } else {
            models.User.where({email: userEmail}).save({image: filename}, {patch: true}).then(() =>{
              if(password) {
                return;
              } else {
                res.status(200).send({image: filename});
              }
            });
          }
        }
      })
    }).catch(err => {
      return next(err);
    })
  }
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      if(err) {
        return next(err);
      }
      models.User.where({email: userEmail}).save({password_digest: hash}, {patch: true}).then(() =>{
          res.status(200).send({});
        }).catch(err => {
          return next(err);
        });
    });
  }
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
  let filename = null;
  if (req.files  && req.files.length) {
      filename = req.files[0].location;
      multipleUpload(req, res, (err) => {
      if (err) {
        return res.send({success: false});
      } else {
        // models.User.forge({email: userEmail}).fetch().then(function (user) {
          // fs.unlink(`public/${user.get('image')}`, () => {});
        // });
        models.User.where({email: userEmail})
          .save({image: filename}, {patch: true});
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
      for (let role of roles.models) {
        if (role.attributes['role'] === req.body.selectedRole) {
          models.User.where({email: userEmail})
           .save({role_id: role.attributes['id']}, {patch: true});
        }
      }
    }
  });
  const imageResponse = req.files ? {image: filename} : {success: 'ok'};
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
  }).catch(err => {
    return res.status(400).send(err);
  });
}


module.exports = {deleteUser, createUser, getUsersList, login, register, tokenVerify, profile, update};
