const express = require('express');
const router = express.Router();
const laudoController = require('../controllers/laudoController');
const { autenticarUsuario, verificarSePerito } = require('../middlewares/authMiddleware');

const Evidencia = require('../models/Evidencia');
const Laudo = require('../models/Laudo');
const montarPromptLaudo = require('../utils/montarPromptLaudo'); // ou onde estiver

router.use(autenticarUsuario);


router.post('/ia', async (req, res) => {
  try {
    const openai = req.openai;
    const { evidenciaId, tipoLaudo } = req.body;

    if (!evidenciaId) return res.status(400).json({ error: 'ID da evidência é obrigatório.' });

    // Busca e geração
    const evidencia = await Evidencia.findById(evidenciaId).populate('caso');
    if (!evidencia) return res.status(404).json({ error: 'Evidência não encontrada' });

    const prompt = montarPromptLaudo(evidencia, tipoLaudo);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const resposta = completion.choices[0].message.content;

    const novoLaudo = await Laudo.create({
      evidencia: evidencia._id,
      tipo: tipoLaudo,
      conteudo: resposta,
      conclusao: 'Conclusão extraída automaticamente.' // Exemplo
    });

    res.json({ data: novoLaudo });

  } catch (err) {
    console.error('[ERRO ao gerar laudo IA]', err); // <- isso mostra o erro real no terminal
    res.status(500).json({ error: 'Erro na API de laudos' });
  }
});


router.get('/', laudoController.listarLaudos);
router.get('/:id', laudoController.obterLaudo);
router.put('/:id', verificarSePerito, laudoController.atualizarLaudo);
router.put('/:id/finalizar', verificarSePerito, laudoController.finalizarLaudo);

module.exports = router;
