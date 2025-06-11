const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/relatorioController');
const { autenticarUsuario } = require('../middlewares/authMiddleware');
const IARelatorioService = require('../services/iaRelatorioService');
const Relatorio = require('../models/Relatorio');

const iaRelatorioService = new IARelatorioService();

// Middleware de autenticação (se desejar proteger)
router.use(autenticarUsuario);

// ROTAS JÁ EXISTENTES:
router.post('/casos/:casoId/relatorios', RelatorioController.criarRelatorio);
router.get('/casos/:casoId/relatorios', RelatorioController.listarRelatoriosPorCaso);
router.put('/relatorios/:id', RelatorioController.atualizarRelatorio);
router.delete('/relatorios/:id', RelatorioController.deletarRelatorio);

// NOVA ROTA IA
router.post('/ia', async (req, res) => {
  try {
    const { casoId } = req.body;

    if (!casoId) {
      return res.status(400).json({ error: 'O ID do caso é obrigatório.' });
    }

    const resultadoIA = await iaRelatorioService.gerarRelatorio(casoId);

    const novoRelatorio = await Relatorio.create({
      caso: casoId,
      titulo: resultadoIA.titulo,
      descricao: resultadoIA.descricao
    });

    res.json({ data: novoRelatorio });
  } catch (err) {
    console.error('[ERRO ao gerar relatório IA]', err);
    res.status(500).json({ error: 'Erro na IA ao gerar relatório' });
  }
});

module.exports = router;
