const multer = require('multer');
const path = require('path');

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
function getId(roles, userRole) {
  return roles.filter((role) => {return role.attributes.role == userRole})[0].attributes.id;
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

module.exports = {isPasswordValid, isUser, isPremium, isAdmin, getRole, upload, getId};