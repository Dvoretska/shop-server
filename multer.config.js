const multer = require('multer');
const path = require('path');

export interface MulterConfig {
  storage: any;
  fileFilter: any
}

export const multerConfig: MulterConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  fileFilter: function(req, file, callback) {
    if(!file) {
       callback(null, false, 'Error')
    }
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.fileValidationError = 'Only images are allowed';
      return callback(null, false, req.fileValidationError)
    }
    callback(null, true);
    }
}