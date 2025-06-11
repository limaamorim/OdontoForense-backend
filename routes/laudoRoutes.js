const express = require('express');
const router = express.Router();
const laudoController = require('../controllers/laudoController');
const { autenticarUsuario, verificarSePerito } = require('../middlewares/authMiddleware');
const IALaudoService = require('../services/iaLaudoService');

router.use(autenticarUsuario);

router.post('/ia', async (req, res) => {
  try {
    const { evidenciaId, tipoLaudo } = req.body;
    const peritoId = req.usuario._id; // supondo que o usuário logado seja o perito

    if (!evidenciaId) return res.status(400).json({ error: 'ID da evidência é obrigatório.' });

    const iaService = new IALaudoService();
    const resultado = await iaService.gerarLaudo(evidenciaId, peritoId, tipoLaudo);

    // Aqui você poderia salvar no banco se quiser:
    const novoLaudo = await Laudo.create({
      evidencia: evidenciaId,
      tipo: tipoLaudo,
      conteudo: resultado.conteudo,
      conclusao: resultado.conclusao
    });

    res.json({ data: novoLaudo });

  } catch (err) {
    console.error('[ERRO ao gerar laudo IA]', err);
    res.status(500).json({ error: 'Erro na API de laudos' });
  }
});

module.exports = router;


router.get('/', laudoController.listarLaudos);
router.get('/:id', laudoController.obterLaudo);
router.put('/:id', verificarSePerito, laudoController.atualizarLaudo);
router.put('/:id/finalizar', verificarSePerito, laudoController.finalizarLaudo);

module.exports = router;
