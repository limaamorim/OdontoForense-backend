const express = require('express');
const router = express.Router();
const vitimaController = require('../controllers/vitimaController');
const upload = require('../middlewares/uploadMiddleware');
const { autenticarUsuario } = require('../middlewares/authMiddleware');  // IMPORTAÇÃO CORRETA

router.post('/casos/:casoId/vitimas', autenticarUsuario, vitimaController.criarVitima);
router.get('/casos/:casoId/vitimas', autenticarUsuario, vitimaController.listarVitimasPorCaso);
router.get('/vitimas/:id', autenticarUsuario, vitimaController.obterVitima);
router.put('/vitimas/:id', autenticarUsuario, vitimaController.atualizarVitima);
router.delete('/vitimas/:id', autenticarUsuario, vitimaController.deletarVitima);

module.exports = router;
