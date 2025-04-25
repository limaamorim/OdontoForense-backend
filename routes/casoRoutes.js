const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

// Rotas protegidas
router.post('/', casoController.criarCaso);
router.get('/', casoController.listarCasos);
router.get('/buscar', casoController.buscarCasos);
router.get('/recentes', casoController.obterCasosRecentes); // <- ✅ mover para cima
router.get('/:id', casoController.obterCaso);
router.put('/:id', casoController.atualizarCaso);

module.exports = router;
