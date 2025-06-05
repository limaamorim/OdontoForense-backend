const Evidencia = require('../models/Evidencia');
const fs = require('fs');
const path = require('path');

// Criar nova evidência
exports.criarEvidencia = async (req, res) => {
  try {
    const { casoId } = req.params;
    const { tipo, descricao } = req.body;
    const arquivo = req.file?.filename; // Nome do arquivo salvo pelo multer

    // Validação básica
    if (!arquivo || !tipo || !descricao || !casoId || !req.usuario?.id) {
      // Se houver arquivo mas validação falhar, remova-o
      if (req.file) {
        fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
      }
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const novaEvidencia = await Evidencia.create({
      caso: casoId,
      tipo,
      descricao,
      caminhoArquivo: `/uploads/${arquivo}`, // Caminho relativo para acesso
      uploadPor: req.usuario.id
    });

    res.status(201).json(novaEvidencia);
  } catch (err) {
    // Se ocorrer erro, remove o arquivo enviado
    if (req.file) {
      fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
    }
    console.error('Erro ao salvar evidência:', err);
    res.status(500).json({ error: 'Erro ao salvar evidência' });
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
    console.error('Erro ao listar evidências:', err);
    res.status(500).json({ success: false, error: 'Erro ao listar evidências' });
  }
};

// Atualizar evidência
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
    console.error('Erro ao atualizar evidência:', err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar evidência' });
  }
};

// Deletar evidência
exports.deletarEvidencia = async (req, res) => {
  try {
    const { id } = req.params;

    const evidencia = await Evidencia.findById(id);
    if (!evidencia) {
      return res.status(404).json({ success: false, error: 'Evidência não encontrada' });
    }

    // Remover imagem do disco
    if (evidencia.imagem) {
      const imagePath = path.join(__dirname, '../uploads', evidencia.imagem);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Evidencia.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: 'Evidência deletada com sucesso!',
    });
  } catch (err) {
    console.error('Erro ao deletar evidência:', err);
    res.status(500).json({ success: false, error: 'Erro ao deletar evidência' });
  }
};
