const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const upload = require('../middleware/uploadMiddleware'); // Importe o middleware

// POST /api/evidencias
router.post('/', upload.single('imagem'), async (req, res) => {
  const { nome, descricao, tipo, caso } = req.body;
  const imagem = req.file?.filename || '';

  try {
    const evidencia = await Evidencia.create({ nome, descricao, tipo, imagem, caso });
    res.status(201).json(evidencia);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar evidência' });
  }
});
// GET /evidencias
router.get('/', evidenciaController.listarEvidencias);

// DELETE /evidencias/:id
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
