const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticarUsuario } = require('../middlewares/authMiddleware'); // Corrigido: importa apenas a função necessária
const upload = require('../middlewares/uploadMiddleware'); // Middleware de upload

// @route   POST api/auth/login
// @desc    Login de usuário
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/usuario
// @desc    Obter usuário logado
// @access  Private
router.get('/usuario', autenticarUsuario, authController.getUsuario);

// Se você tiver uma rota para upload de arquivos, ela seria algo assim:
// @route   POST api/auth/upload
// @desc    Fazer upload de arquivos
// @access  Private
router.post('/upload', autenticarUsuario, upload.single('file'), (req, res) => {
  res.json({ message: 'Arquivo enviado com sucesso', file: req.file });
});

module.exports = router;
