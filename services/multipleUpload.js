const fs = require('fs');
const multer = require('multer');
const path = require('path');


let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

let multipleUpload = multer({storage: storage}).array('file', 12);


module.exports = multipleUpload;
