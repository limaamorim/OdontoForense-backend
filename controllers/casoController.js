const Evidencia = require('../models/Evidencia');
const Caso = require('../models/Caso');
const fs = require('fs');
const path = require('path');

// Criar nova evidência
exports.criarEvidencia = async (req, res) => {
  try {
    const { descricao } = req.body;
    const casoId = req.body.caso;
    console.log({ body: req.body, file: req.file, params: req.params });
    const arquivo = req.file;

    // Validação básica
    if (!arquivo) {
      return res.status(400).json({ error: 'Arquivo não enviado.' });
    }

    if (!descricao || !descricao.trim()) {
      fs.unlinkSync(path.join(__dirname, '../uploads', arquivo.filename));
      return res.status(400).json({ error: 'Descrição é obrigatória.' });
    }

    // Mapeamento do tipo com base no MIME
    const tipoMapeado = {
      'image/jpeg': 'foto',
      'image/png': 'foto',
      'image/gif': 'foto',
      'application/pdf': 'documento'
    };

    const tipo = tipoMapeado[arquivo.mimetype] || 'outros';

    // Criação da evidência
    const novaEvidencia = await Evidencia.create({
      nome: arquivo.originalname,          // nome do arquivo original
      descricao,
      tipo,
      imagem: arquivo.filename,            // nome do arquivo salvo
      caso: casoId
    });

    // Relaciona a evidência ao caso
    await Caso.findByIdAndUpdate(casoId, { $push: { evidencias: novaEvidencia._id } });

    res.status(201).json(novaEvidencia);
  } catch (err) {
    console.error('Erro ao salvar evidência:', err);

    // Remove o arquivo salvo se deu erro
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ error: 'Erro ao salvar evidência.' });
  }
};

// GET /evidencias
// GET /evidencias
exports.listarEvidencias = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.casoId) {
      filtro.caso = req.query.casoId;
    }

    const evidencias = await Evidencia.find(filtro).populate('caso');

    // Envolvendo em um objeto com `data.docs`
    res.json({ data: { docs: evidencias } });
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
