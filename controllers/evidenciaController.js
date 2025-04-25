const Evidencia = require('../models/Evidencia');

exports.criarEvidencia = async (req, res) => {
  try {
    const { casoId } = req.params;
    const { tipo, descricao } = req.body;

    console.log('[DEBUG] Params:', req.params);
    console.log('[DEBUG] Body:', req.body);
    console.log('[DEBUG] File:', req.file);
    console.log('[DEBUG] Usuario:', req.usuario);

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Arquivo não enviado.' });
    }

    const novaEvidencia = await Evidencia.create({
      caso: casoId,
      tipo,
      descricao,
      caminhoArquivo: req.file.path,
      uploadPor: req.usuario.id
    });

    res.status(201).json({
      success: true,
      data: novaEvidencia,
    });
  } catch (err) {
    console.error('[ERRO AO CRIAR EVIDÊNCIA]', err);
    res.status(500).json({ success: false, error: 'Erro ao criar evidência' });
  }
};

exports.listarEvidenciasPorCaso = async (req, res) => {
  try {
    const { casoId } = req.params;

    const evidencias = await Evidencia.find({ caso: casoId })
      .populate('uploadPor', 'nome')
      .populate('caso');

    res.status(200).json({
      success: true,
      data: evidencias,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao listar evidências' });
  }
};

exports.atualizarEvidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const atualizacoes = req.body;

    const evidenciaAtualizada = await Evidencia.findByIdAndUpdate(id, atualizacoes, { new: true });

    res.status(200).json({
      success: true,
      data: evidenciaAtualizada,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar evidência' });
  }
};

exports.deletarEvidencia = async (req, res) => {
  try {
    const { id } = req.params;

    await Evidencia.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: 'Evidência deletada com sucesso!',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao deletar evidência' });
  }
};
