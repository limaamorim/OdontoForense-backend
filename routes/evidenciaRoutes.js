const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const upload = require('../middlewares/uploadMiddleware'); // seu multer configurado
const evidenciaController = require('../controllers/evidenciaController');

// Criar evidência vinculada a um caso (rota RESTful)
router.post('/casos/:casoId/evidencias', upload.single('imagem'), evidenciaController.criarEvidencia);

// Listar evidências (pode filtrar por caso via query string)
router.get('/', evidenciaController.listarEvidencias);

// Deletar evidência
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
