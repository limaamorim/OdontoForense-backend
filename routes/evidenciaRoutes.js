const express = require('express');
const router = express.Router();
const evidenciaController = require('../controllers/evidenciaController');
const upload = require('../middlewares/uploadMiddleware');

// POST /evidencias
router.post('/', upload.single('imagem'), evidenciaController.criarEvidencia);

// GET /evidencias
router.get('/', evidenciaController.listarEvidencias);

// DELETE /evidencias/:id
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
