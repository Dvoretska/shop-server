const fs = require('fs');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
//
// let storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });
//
// let multipleUpload = multer({storage: storage}).array('file', 12);
//
const fileFilter = function(req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        req.fileValidationError = 'Only images are allowed';
        return callback(null, false, req.fileValidationError)
    }
    callback(null, true)
};

AWS.config.update({
   accessKeyId: process.env.IAM_USER_KEY,
   secretAccessKey: process.env.IAM_USER_SECRET,
   region: 'eu-central-1'
});

let s3 = new AWS.S3();

var upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: process.env.BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname + '-' + Date.now() + path.extname(file.originalname)});
    },
    key: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
});

let multipleUpload = upload.array('file', 12);

module.exports = multipleUpload;
