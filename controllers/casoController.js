const Caso = require('../models/Caso');
const Evidencia = require('../models/Evidencia');
const Usuario = require('../models/Usuario');
const Vitima = require('../models/Vitima');

exports.criarCaso = async (req, res) => {
  console.log('TIPO DE USUÁRIO NO BACKEND:', req.usuario.tipo);
  const tiposPermitidos = ['assistente', 'administrador'];
  if (!tiposPermitidos.includes(req.usuario.tipo)) {
    return res.status(403).json({ success: false, error: 'Apenas peritos ou administradores podem criar casos' });
  }

  const { numeroCaso, titulo, descricao, dataOcorrido, local, vitimas } = req.body;
  if (!numeroCaso || !titulo || !descricao || !dataOcorrido || !local) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios faltando: numeroCaso, titulo, descricao, dataOcorrido, local'
    });
  }

  const casoExistente = await Caso.findOne({ numeroCaso });
  if (casoExistente) {
    return res.status(400).json({ success: false, error: 'Já existe um caso com este número' });
  }

  const novoCaso = new Caso({
    numeroCaso,
    titulo,
    descricao,
    dataOcorrido,
    local,
    peritoResponsavel: req.usuario.id
  });

  // Criar vítimas (se fornecidas)
  if (vitimas && Array.isArray(vitimas)) {
    const vitimaIds = [];
    for (const vitimaData of vitimas) {
      const novaVitima = new Vitima({
        ...vitimaData,
        casos: [novoCaso._id]
      });
      const vitimaSalva = await novaVitima.save();
      vitimaIds.push(vitimaSalva._id);
    }
    novoCaso.vitimas = vitimaIds;
  }

  const casoSalvo = await novoCaso.save();
  res.status(201).json({ success: true, data: casoSalvo });
};

exports.listarCasos = async (req, res) => {
  try {
    let query = {};
    let options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sort: { dataAbertura: -1 },
      populate: {
        path: 'peritoResponsavel',
        select: 'nome email'
      }
    };

    if (req.usuario.tipo === 'perito') {
      query.peritoResponsavel = req.usuario.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const casos = await Caso.paginate(query, options);

    res.json({ success: true, data: casos });
  } catch (err) {
    console.error('Erro ao listar casos:', err.message);
    res.status(500).json({ success: false, error: 'Erro no servidor ao listar casos' });
  }
};

exports.obterCaso = async (req, res) => {
  try {
    const caso = await Caso.findById(req.params.id)
      .populate('peritoResponsavel', 'nome email')
      .populate('evidencias')
      .populate('vitimas'); // <-- adiciona as vítimas

    if (!caso) {
      return res.status(404).json({ success: false, error: 'Caso não encontrado' });
    }

    const usuario = req.usuario;
    console.log('Usuário tentando acessar o caso:', usuario);

    if (usuario.tipo === 'administrador' || usuario.tipo === 'perito') {
      return res.json({ success: true, data: caso });
    }

    return res.status(403).json({ success: false, error: 'Acesso não autorizado' });
  } catch (err) {
    console.error('Erro ao obter caso:', err.message);
    return res.status(500).json({ success: false, error: 'Erro no servidor ao obter caso' });
  }
};



exports.atualizarCaso = async (req, res) => {
  try {
    let caso = await Caso.findById(req.params.id);

    if (!caso) {
      return res.status(404).json({ success: false, error: 'Caso não encontrado' });
    }

    if (req.usuario.tipo === 'perito' && caso.peritoResponsavel.toString() !== req.usuario.id) {
      return res.status(403).json({ success: false, error: 'Você só pode editar seus próprios casos' });
    }

    if (req.body.numeroCaso && req.body.numeroCaso !== caso.numeroCaso) {
      return res.status(400).json({ success: false, error: 'Não é permitido alterar o número do caso' });
    }

    caso = await Caso.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('peritoResponsavel', 'nome email');

    res.json({ success: true, data: caso });
  } catch (err) {
    console.error('Erro ao atualizar caso:', err.message);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ success: false, error: 'Erro de validação', details: errors });
    }
    res.status(500).json({ success: false, error: 'Erro no servidor ao atualizar caso' });
  }
};

exports.buscarCasos = async (req, res) => {
  try {
    const { termo } = req.query;

    if (!termo || termo.trim() === '') {
      return res.status(400).json({ success: false, error: 'Termo de busca não fornecido' });
    }

    let query = {
      $or: [
        { numeroCaso: { $regex: termo, $options: 'i' } },
        { titulo: { $regex: termo, $options: 'i' } },
        { descricao: { $regex: termo, $options: 'i' } },
        { local: { $regex: termo, $options: 'i' } }
      ]
    };

    if (req.usuario.tipo === 'perito') {
      query.peritoResponsavel = req.usuario.id;
    }

    const casos = await Caso.find(query)
      .populate('peritoResponsavel', 'nome email')
      .sort({ dataAbertura: -1 })
      .limit(20);

    res.json({ success: true, count: casos.length, data: casos });
  } catch (err) {
    console.error('Erro ao buscar casos:', err.message);
    res.status(500).json({ success: false, error: 'Erro no servidor ao buscar casos' });
  }
};

exports.adicionarEvidencia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const caso = await Caso.findById(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, error: 'Caso não encontrado' });
    }

    const novaEvidencia = new Evidencia({
      caso: req.params.id,
      caminhoArquivo: req.file.path,
      nomeOriginal: req.file.originalname,
      tipo: req.file.mimetype,
      tamanho: req.file.size,
      enviadoPor: req.usuario.id
    });

    await novaEvidencia.save();

    await Caso.findByIdAndUpdate(req.params.id, {
      $push: { evidencias: novaEvidencia._id }
    });

    res.status(201).json({ success: true, data: novaEvidencia });
  } catch (err) {
    console.error('Erro ao adicionar evidência:', err.message);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'ID do caso inválido' });
    }
    res.status(500).json({ success: false, error: 'Erro no servidor ao adicionar evidência' });
  }
};

exports.obterCasosRecentes = async (req, res) => {
  try {
    let filtro = {};
    if (req.usuario.tipo === 'perito') {
      filtro.peritoResponsavel = req.usuario.id;
    }

    const casosRecentes = await Caso.find(filtro)
      .sort({ dataAbertura: -1 })
      .limit(5)
      .select('numeroCaso titulo status dataAbertura criadoEm');

    console.log('Casos Recentes retornados pela API:', casosRecentes);

    res.json(casosRecentes);
  } catch (err) {
    console.error('Erro ao listar casos recentes:', err.message);
    res.status(500).json({ success: false, error: 'Erro ao buscar casos recentes' });
  }
};
exports.deletarCaso = async (req, res) => {
  try {
    const caso = await Caso.findById(req.params.id);

    if (!caso) {
      return res.status(404).json({ success: false, error: 'Caso não encontrado' });
    }

    if (req.usuario.tipo === 'perito' && caso.peritoResponsavel.toString() !== req.usuario.id) {
      return res.status(403).json({ success: false, error: 'Você só pode excluir seus próprios casos' });
    }

    await Caso.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Caso deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar caso:', err.message);
    res.status(500).json({ success: false, error: 'Erro no servidor ao deletar caso' });
  }
};

