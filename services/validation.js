const accounts = require('../accounts/models');
const blog = require('../blog/models');
const {Order} = require('../shop/order/models');

const passwordError = 'Password length should be more than 6 characters';
const accessDenied = 'You have no rights for this action.';

function isUser(role) {
  return role == 'user';
}

function isAdmin(role) {
  return role == 'admin';
}

function isPremium(role) {
  return role == 'premium';
}

function getRole(roles, roleId) {
  return roles.filter((role) => {return role.id == roleId})[0].attributes.role
}
function getRoleId(userRole, callback) {
  accounts.Role.forge().fetchAll().then(roles => {
    return callback(roles.filter((role) => {return role.attributes.role == userRole})[0].attributes.id);
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
      accounts.User.forge({email: userEmail}).fetch().then((user) => {
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
}

function allowedRolesHandleBlog(acceptRoles) {
    return function(req, res, next) {
        blog.Post.forge({id: req.body.id}).fetch().then(post => {
            const postOwnerId = post.attributes.user_id;
            const reqUserId = req.user.id;
            accounts.Role.forge().fetchAll().then(roles => {
                const requestRole = getRole(roles, req.user.attributes.role_id);
                if(acceptRoles.indexOf(requestRole) == -1 && postOwnerId != reqUserId) {
                    return res.status(403).send({rights: accessDenied});
                } else {
                  next();
                }
            })
        })
    }
}

function allowedRolesHandleComments(acceptRoles) {
    return function(req, res, next) {
        blog.Comment.forge({id: req.body.id}).fetch().then(comment => {
            const commentOwnerId = comment.attributes.user_id;
            const reqUserId = req.user.id;
            accounts.Role.forge().fetchAll().then(roles => {
                const requestRole = getRole(roles, req.user.attributes.role_id);
                if(acceptRoles.indexOf(requestRole) == -1 || isPremium(requestRole) && commentOwnerId != reqUserId) {
                    return res.status(403).send({rights: accessDenied});
                } else {
                    next();
                }
            })
        })
    }
}

function isPasswordValid(req, res, next) {
  if(req.body.password.length < 7) {
    return res.status(400).send({password: passwordError});
  } else {
    next();
  }
}

function isPasswordValidOrEmpty(req, res, next) {
  if(req.body.password && req.body.password.length < 7) {
    return res.status(400).send({message: passwordError});
  } else {
    next();
  }
}

function isImageValid(req, res, next) {
  if(req.fileValidationError) {
    return res.status(400).send({message: req.fileValidationError});
  } else {
    next();
  }
}

function isAllowedToCurrentUserOnly() {
  return function(req, res, next) {
    Order.forge({order_number: req.params.id}).fetch().then(orders => {
      if(+orders.attributes.user_id === +req.user.id) {
        next();
      } else {
        return res.status(403).send({rights: accessDenied});
      }
    })
  }
}

module.exports = {
    isPasswordValidOrEmpty,
    isAdmin,
    getRoleId,
    getRole,
    allowedRoles,
    isPasswordValid,
    isImageValid,
    limitedAllowedRoles,
    allowedRolesHandleBlog,
    allowedRolesHandleComments,
    isAllowedToCurrentUserOnly
};
