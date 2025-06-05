const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Certifique-se que a pasta uploads existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nome único para o arquivo
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Erro: Apenas arquivos de imagem (JPEG, JPG, PNG, GIF) e PDF são permitidos!');
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

module.exports = upload;
