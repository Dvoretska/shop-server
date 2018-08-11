const accounts = require('../accounts/models');

const passwordError = 'Password length should me more than 6 characters';
const accessDenied = 'You have no rights for this action.';

function isUser(role) {
  return role == 'user';
}

function isAdmin(role) {
  return role == 'admin';
}

function getRole(roles, roleId) {
  return roles.filter((role) => {return role.id == roleId})[0].attributes.role
}
function getRoleId(userRole, callback) {
  accounts.Role.forge().fetchAll().then(roles => {
    callback(roles.filter((role) => {return role.attributes.role == userRole})[0].attributes.id);
  })
}

function allowedRoles(acceptRoles) {
  return function(req, res, next) {
    accounts.Role.forge().fetchAll().then(roles => {
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
    accounts.Role.forge().fetchAll().then(roles => {
      const userEmail = req.body.email;
      accounts.User.forge({email: userEmail}).fetch().then(function (user) {
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

function isPasswordValid(req, res, next) {
  if(req.body.password.length < 7) {
    return res.status(400).send({password: passwordError});
  } else {
    next();
  }
}

function isPasswordValidOrEmpty(req, res, next) {
  if(req.body.password && req.body.password.length < 7) {
    return res.status(400).send({password: passwordError});
  } else {
    next();
  }
}

function isImageValid(req, res, next) {
  if(req.fileValidationError) {
    return res.status(400).send({image: req.fileValidationError});
  } else {
    next();
  }
}

module.exports = {
    isPasswordValidOrEmpty,
    getRole,
    getRoleId,
    allowedRoles,
    isPasswordValid,
    isImageValid,
    limitedAllowedRoles
};