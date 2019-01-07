const AWS = require('aws-sdk');

const deleteImage = function(filename, callback) {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename
  };

  let s3 = new AWS.S3();

  s3.deleteObject(params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

module.exports = deleteImage;