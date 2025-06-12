const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const Caso = require('../models/Caso');
const upload = require('../middlewares/uploadMiddleware'); // multer configurado
const evidenciaController = require('../controllers/evidenciaController');

// Criar evidência vinculada a um caso (upload + Cloudinary)
router.post('/casos/:casoId/evidencias', upload.single('imagem'), async (req, res) => {
  try {
    const { casoId } = req.params;

    // Verifica se caso existe (opcional, mas recomendado)
    const caso = await Caso.findById(casoId);
    if (!caso) {
      return res.status(404).json({ success: false, error: 'Caso não encontrado' });
    }

    // Cria nova evidência com URL da imagem do Cloudinary em req.file.path
    const novaEvidencia = new Evidencia({
      caso: casoId,
      nome: req.body.nome || req.file.originalname,
      tipo: req.body.tipo || 'outros',
      descricao: req.body.descricao || '',
      imagem: req.file.path
    });

    await novaEvidencia.save();

    // Adiciona a evidência ao array de evidências do caso
    await Caso.findByIdAndUpdate(casoId, { $push: { evidencias: novaEvidencia._id } });

    res.status(201).json({ success: true, data: novaEvidencia });
  } catch (err) {
    console.error('Erro ao salvar evidência:', err);
    res.status(500).json({ success: false, error: 'Erro ao salvar evidência' });
  }
});

// Listar evidências de um caso específico
router.get('/casos/:casoId/evidencias', async (req, res) => {
  try {
    const { casoId } = req.params;
    const evidencias = await Evidencia.find({ caso: casoId });

    res.json({ success: true, data: evidencias });
  } catch (err) {
    console.error('Erro ao listar evidências:', err);
    res.status(500).json({ success: false, error: 'Erro ao listar evidências' });
  }
});

// Listar todas as evidências (sem filtro)
router.get('/', evidenciaController.listarEvidencias);

// Deletar uma evidência pelo ID
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
