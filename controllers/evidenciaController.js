const Evidencia = require('../models/Evidencia');
const Caso = require('../models/Caso');
const fs = require('fs');
const path = require('path');

// POST /evidencias
exports.criarEvidencia = async (req, res) => {
  const { nome, descricao, tipo, caso } = req.body;
  const imagem = req.file?.filename;

  if (!imagem) {
    return res.status(400).json({ error: 'Imagem é obrigatória' });
  }

  try {
    const evidencia = await Evidencia.create({
      nome,
      descricao,
      tipo,
      imagem,
      caso
    });

    await Caso.findByIdAndUpdate(caso, { $push: { evidencias: evidencia._id } });

    res.status(201).json(evidencia);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar evidência' });
  }
};

// GET /evidencias
exports.listarEvidencias = async (req, res) => {
  try {
    const evidencias = await Evidencia.find().populate('caso');
    res.json(evidencias);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar evidências' });
  }
};

// DELETE /evidencias/:id
exports.deletarEvidencia = async (req, res) => {
  try {
    const evidencia = await Evidencia.findById(req.params.id);

    if (!evidencia) {
      return res.status(404).json({ error: 'Evidência não encontrada' });
    }

    const imagePath = path.join(__dirname, '../uploads', evidencia.imagem);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Caso.findByIdAndUpdate(evidencia.caso, { $pull: { evidencias: evidencia._id } });
    await Evidencia.findByIdAndDelete(req.params.id);

    res.json({ message: 'Evidência deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar evidência' });
  }
};
