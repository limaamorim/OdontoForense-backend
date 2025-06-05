const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const EvidenciaController = require('../controllers/evidenciaController');
const auth = require('../middlewares/authMiddleware'); // middleware de autenticação

// Configuração do multer (igual ao mini projeto)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// POST /casos/:casoId/evidencias
router.post('/casos/:casoId/evidencias', auth, upload.single('arquivo'), EvidenciaController.criarEvidencia);

// GET, PUT, DELETE (mantém como está)
router.get('/casos/:casoId/evidencias', auth, EvidenciaController.listarEvidenciasPorCaso);
router.put('/evidencias/:id', auth, EvidenciaController.atualizarEvidencia);
router.delete('/evidencias/:id', auth, EvidenciaController.deletarEvidencia);

module.exports = router;
