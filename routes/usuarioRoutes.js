const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

// ROTA PROTEGIDA: apenas usuários autenticados
router.use(authMiddleware);

// Apenas administradores passarão no controller
router.post('/', usuarioController.criarUsuario);
router.get('/', usuarioController.listarUsuarios);
router.get('/:email', usuarioController.obterUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.put('/:id/desativar', usuarioController.desativarUsuario);
router.put('/:id/reativar', usuarioController.reativarUsuario);
router.delete('/:id', usuarioController.excluirUsuario);

module.exports = router;
