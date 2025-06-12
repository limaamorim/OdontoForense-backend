const express = require('express');
const router = express.Router();
const vitimaController = require('../controllers/vitimaController');
const { autenticarUsuario } = require('../middlewares/authMiddleware');  // IMPORTAÇÃO CORRETA

router.get('/', autenticarUsuario, vitimaController.listarTodasVitimas); 

router.post('/:casoId', autenticarUsuario, vitimaController.criarVitima);
router.get('/:casoId', autenticarUsuario, vitimaController.listarVitimasPorCaso);
router.get('/detalhes/:id', autenticarUsuario, vitimaController.obterVitima);
router.put('/detalhes/:id', autenticarUsuario, vitimaController.atualizarVitima);
router.delete('/detalhes/:id', autenticarUsuario, vitimaController.deletarVitima);


module.exports = router;
