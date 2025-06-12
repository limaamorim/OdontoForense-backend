const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const upload = require('../middlewares/uploadMiddleware'); // seu multer configurado
const evidenciaController = require('../controllers/evidenciaController');

// Criar evidência vinculada a um caso (rota RESTful)
router.post('/evidencias', upload.single('imagem'), async (req, res) => {
  try {
    const novaEvidencia = new Evidencia({
      casoId: req.body.casoId,
      nome: req.body.nome,
      imagem: req.file.path // <- atenção: Cloudinary já retorna a URL pública aqui
    });
    await novaEvidencia.save();
    res.status(201).json(novaEvidencia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar evidência' });
  }
});


// Listar evidências (pode filtrar por caso via query string)
router.get('/', evidenciaController.listarEvidencias);

// Deletar evidência
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
