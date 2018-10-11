const fs = require('fs');
const Multer = require('multer');
const path = require('path');
const firebase = require('firebase');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
  projectId: "shop-project-219109",
  keyFilename: "shop-project-219109-0d3208e2bbfa.json"
});

const bucket = storage.bucket("shop-project-219109");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadImageToStorage = (file) => {
  let prom = new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${file.originalname}_${Date.now()}`;

    let fileUpload = bucket.file(newFileName);
    console.log(fileUpload)

    const blobStream = fileUpload.createWriteStream();

    blobStream.on('error', (error) => {
      reject('Something is wrong! Unable to upload at the moment.');
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
  return prom;
};

const uploadFirebase = multer.single('file');

module.exports = {uploadFirebase, uploadImageToStorage};
