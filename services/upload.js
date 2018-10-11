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

const fileFilter = function(req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        req.fileValidationError = 'Only images are allowed';
        return callback(null, false, req.fileValidationError)
    }
    callback(null, true)
};

let upload = multer({storage: storage, fileFilter: fileFilter}).single('file');

module.exports = upload;
