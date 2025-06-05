const express = require('express');
const router = express.Router();
const EvidenciaController = require('../controllers/evidenciaController');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware');

router.post('/casos/:casoId/evidencias', auth, upload.single('arquivo'), EvidenciaController.criarEvidencia);
router.get('/casos/:casoId/evidencias', auth, EvidenciaController.listarEvidenciasPorCaso);
router.put('/evidencias/:id', auth, EvidenciaController.atualizarEvidencia);
router.delete('/evidencias/:id', auth, EvidenciaController.deletarEvidencia);

module.exports = router;
