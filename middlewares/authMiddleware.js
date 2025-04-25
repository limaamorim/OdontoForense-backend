const jwt = require('jsonwebtoken');
const config = require('../config/db');
const Usuario = require('../models/Usuario'); // Importe seu modelo de Usuário

module.exports = async function(req, res, next) {
  // Obter token do header (compatível com 'Bearer' e 'x-auth-token')
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não encontrado, autorização negada'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.secretOrKey);
    
    // Buscar usuário no banco
    const usuario = await Usuario.findById(decoded.usuario.id).select('-senha');
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Adicionar usuário à requisição
    req.usuario = {
      id: usuario._id,
      tipo: usuario.tipo // Assumindo que seu modelo tem um campo 'tipo'
    };

    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);
    
    let errorMsg = 'Token inválido';
    if (err.name === 'TokenExpiredError') {
      errorMsg = 'Token expirado';
    } else if (err.name === 'JsonWebTokenError') {
      errorMsg = 'Token malformado';
    }

    // Limpar o token do lado do cliente e redirecionar para o login
    res.status(401).json({
      success: false,
      error: errorMsg
    });
  }
};
