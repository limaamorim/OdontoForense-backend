const express = require('express');
const router = express.Router();
const laudoController = require('../controllers/laudoController');
const authMiddleware = require('../middlewares/authMiddleware');
const peritoMiddleware = require('../middlewares/peritoMiddleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Rotas abertas para peritos
router.post('/', peritoMiddleware, laudoController.criarLaudo);
router.get('/', laudoController.listarLaudos);
router.get('/:id', laudoController.obterLaudo);
router.put('/:id', peritoMiddleware, laudoController.atualizarLaudo);
router.put('/:id/finalizar', peritoMiddleware, laudoController.finalizarLaudo);

// Nova rota para versão IA
router.post('/ia', peritoMiddleware, laudoController.criarLaudoIA);

module.exports = router;
