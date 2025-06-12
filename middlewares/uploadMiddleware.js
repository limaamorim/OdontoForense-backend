const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // caminho para o arquivo cloudinary.js

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'odontoforense',  // pasta no Cloudinary (opcional)
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1200, crop: "limit" }]
  }
});

const upload = multer({ storage });

module.exports = upload;
