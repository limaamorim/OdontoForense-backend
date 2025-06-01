const express = require('express');
const router = express.Router();
const laudoController = require('../controllers/laudoController');
// const authMiddleware = require('../middlewares/authMiddleware');

// Rotas abertas
router.post('/', laudoController.criarLaudo);
router.get('/', laudoController.listarLaudos);
router.get('/:id', laudoController.obterLaudo);
router.put('/:id', laudoController.atualizarLaudo);
router.put('/:id/finalizar', laudoController.finalizarLaudo);

/*
// Rotas protegidas (versão final)
router.use(authMiddleware);

router.post('/', laudoController.criarLaudo);
router.get('/', laudoController.listarLaudos);
router.get('/:id', laudoController.obterLaudo);
router.put('/:id', laudoController.atualizarLaudo);
router.put('/:id/finalizar', laudoController.finalizarLaudo);
*/

module.exports = router;