const express = require('express');
const router = express.Router();
const Evidencia = require('../models/Evidencia');
const Caso = require('../models/Caso'); // adicionei aqui pois será usado
const upload = require('../middlewares/uploadMiddleware'); // multer configurado
const evidenciaController = require('../controllers/evidenciaController');

// Rota corrigida para criação da evidência vinculada a um caso (rota RESTful)
router.post('/casos/:casoId/evidencias', upload.single('imagem'), async (req, res) => {
  try {
    const { casoId } = req.params;

    // Cria a evidência usando a URL da imagem (Cloudinary já fornece URL pública em req.file.path)
    const novaEvidencia = new Evidencia({
      caso: casoId,              // chave correta para referenciar o caso no model Evidencia
      nome: req.body.nome || req.file.originalname, // pega nome da evidência
      tipo: req.body.tipo,
      descricao: req.body.descricao,
      imagem: req.file.path
    });

    await novaEvidencia.save();

    // Atualiza o caso para referenciar a nova evidência
    await Caso.findByIdAndUpdate(casoId, { $push: { evidencias: novaEvidencia._id } });

    res.status(201).json(novaEvidencia);
  } catch (err) {
    console.error('Erro ao salvar evidência:', err);
    res.status(500).json({ error: 'Erro ao salvar evidência' });
  }
});

// Listar evidências (pode filtrar por caso via query string)
router.get('/', evidenciaController.listarEvidencias);

// Deletar evidência
router.delete('/:id', evidenciaController.deletarEvidencia);

module.exports = router;
