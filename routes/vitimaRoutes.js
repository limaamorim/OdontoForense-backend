const express = require('express');
const router = express.Router();
const vitimaController = require('../controllers/vitimaController');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware'); // ✅ Correção aqui

router.post('/casos/:casoId/vitimas', auth, vitimaController.criarVitima);
router.get('/casos/:casoId/vitimas', auth, vitimaController.listarVitimasPorCaso);
router.get('/vitimas/:id', auth, vitimaController.obterVitima);
router.put('/vitimas/:id', auth, vitimaController.atualizarVitima);
router.delete('/vitimas/:id', auth, vitimaController.deletarVitima);

module.exports = router;
