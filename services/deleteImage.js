const AWS = require('aws-sdk');

const deleteImage = function(removedFiles) {
  var objects = [];
  for(var index in removedFiles){
    objects.push({Key : removedFiles[index].filename});
  }
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Delete: {
      Objects: objects
    }
  };

  let s3 = new AWS.S3();

  return s3.deleteObjects(params).promise();
};

module.exports = deleteImage;
