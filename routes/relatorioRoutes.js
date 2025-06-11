const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/relatorioController');

// Criar um novo relatório
router.post('/casos/:casoId/relatorios', RelatorioController.criarRelatorio);

// Listar todos os relatórios de um caso específico
router.get('/casos/:casoId/relatorios', RelatorioController.listarRelatoriosPorCaso);

// Atualizar um relatório
router.put('/relatorios/:id', RelatorioController.atualizarRelatorio);

// Deletar um relatório
router.delete('/relatorios/:id', RelatorioController.deletarRelatorio);

module.exports = router;