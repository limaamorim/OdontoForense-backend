const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');
const { autenticarUsuario } = require('../middlewares/authMiddleware'); // ✅ Importa a função correta
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// Aplica o middleware de autenticação para todas as rotas
router.use(autenticarUsuario); // ✅ Agora sim é uma função válida

// Rotas protegidas
router.post('/', casoController.criarCaso);
router.get('/', casoController.listarCasos);
router.get('/buscar', casoController.buscarCasos);
router.get('/recentes', casoController.obterCasosRecentes);
router.get('/:id', casoController.obterCaso);
router.put('/:id', casoController.atualizarCaso);
router.delete('/:id', casoController.deletarCaso);

// Rota para adicionar evidência vinculada a um caso
router.post('/:id/evidencias', uploadMiddleware.single('arquivo'), casoController.adicionarEvidencia);

module.exports = router;
