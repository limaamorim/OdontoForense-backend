const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

exports.criarUsuario = async (req, res) => {
  // 0. RESTRIÇÃO DE ACESSO
  if (!req.usuario || !['administrador'].includes(req.usuario.tipo)) {
  return res.status(403).json({
    success: false,
    error: 'Apenas administradores podem criar novos usuários'
  });
}


  // 1. VALIDAÇÃO INICIAL
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ 
      success: false,
      error: 'Corpo da requisição inválido ou vazio' 
    });
  }

  // 2. DESTRUTURAÇÃO COM VALORES PADRÃO
  const { 
    nome = '', 
    email = '', 
    senha = '', 
    tipo = 'assistente', 
    registroProfissional = '' 
  } = req.body;

  // 3. VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
  if (!nome.trim() || !email.trim() || !senha.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Nome, email e senha são obrigatórios',
      missing_fields: {
        nome: !nome.trim(),
        email: !email.trim(),
        senha: !senha.trim()
      }
    });
  }

  // 4. VALIDAÇÃO DO TIPO DE USUÁRIO
  const tiposValidos = ['assistente', 'perito', 'administrador'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de usuário inválido',
      allowed_types: tiposValidos
    });
  }

  try {
    // 6. VERIFICAÇÃO DE USUÁRIO EXISTENTE
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }

    const novoUsuario = new Usuario({
      nome,
      email,
      senha, // Deixe a criptografia para o model
      tipo,
      registroProfissional: tipo === 'perito' ? registroProfissional.trim() : undefined,
      createdAt: new Date()
    });

    // 9. SALVAMENTO NO BANCO DE DADOS
    const usuarioSalvo = await novoUsuario.save();

    // 10. PREPARAÇÃO DA RESPOSTA (SEM DADOS SENSÍVEIS)
    const resposta = {
      success: true,
      data: {
        _id: usuarioSalvo._id,
        nome: usuarioSalvo.nome,
        email: usuarioSalvo.email,
        tipo: usuarioSalvo.tipo,
        createdAt: usuarioSalvo.createdAt
      }
    };

    // 11. RESPOSTA DE SUCESSO
    res.status(201).json(resposta);

  } catch (err) {
    // 12. TRATAMENTO DE ERROS
    console.error('Erro no controller:', err);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



exports.listarUsuarios = async (req, res) => {
  try {
    if (req.usuario.tipo !== 'administrador') {
      return res.status(403).json({ msg: 'Não autorizado' });
    }

    const usuarios = await Usuario.find().select('-senha');

    res.status(200).json({
      success: true,
      data: usuarios
    });
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message);
    res.status(500).json({ success: false, error: 'Erro no servidor' });
  }
};


exports.obterUsuario = async (req, res) => {
  try {
    // Apenas administradores ou o próprio usuário podem ver os detalhes
    if (req.usuario.tipo !== 'administrador' ) {
      return res.status(403).json({ msg: 'Não autorizado' });
    }

    const usuario = await Usuario.findById(req.params.id).select('-senha');
    
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    // Apenas administradores podem atualizar qualquer usuário
    // Ou o próprio usuário pode atualizar seu próprio perfil (exceto tipo)
    if (req.usuario.tipo !== 'administrador' ) {
      return res.status(403).json({ msg: 'Não autorizado' });
    }

    // Não permitir que não-administradores alterem o tipo
    if (req.usuario.tipo !== 'administrador' && req.body.tipo) {
      return res.status(400).json({ msg: 'Não é permitido alterar o tipo de usuário' });
    }

    const updateData = { ...req.body };

    // Se estiver atualizando a senha, hash it
    if (updateData.senha) {
      updateData.senha = await bcrypt.hash(updateData.senha, 10);
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-senha');

    res.json(usuario);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.desativarUsuario = async (req, res) => {
  try {
    // Apenas administradores podem desativar usuários
    if (req.usuario.tipo !== 'administrador') {
      return res.status(403).json({ msg: 'Não autorizado' });
    }

    // Não permitir desativar a si mesmo
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ msg: 'Não é permitido desativar sua própria conta' });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    ).select('-senha');

    res.json(usuario);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.reativarUsuario = async (req, res) => {
  try {
    // Apenas administradores podem reativar usuários
    if (req.usuario.tipo !== 'administrador') {
      return res.status(403).json({ msg: 'Não autorizado' });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { ativo: true },
      { new: true }
    ).select('-senha');

    res.json(usuario);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
exports.excluirUsuario = async (req, res) => {
  try {
    if (req.usuario.tipo !== 'administrador') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err.message);
    res.status(500).json({ success: false, error: 'Erro no servidor ao excluir usuário' });
  }
};
