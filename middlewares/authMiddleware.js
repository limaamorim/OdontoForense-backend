const jwt = require('jsonwebtoken');
const config = require('../config/db');
const Usuario = require('../models/Usuario');

module.exports = async function(req, res, next) {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não encontrado, autorização negada'
    });
  }

  try {
    const decoded = jwt.verify(token, config.secretOrKey);

    const usuario = await Usuario.findById(decoded.usuario.id).select('-senha');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    req.usuario = {
      id: usuario._id,
      tipo: usuario.tipo?.toLowerCase() // ⚠️ Garantir lowercase
    };

    next();
  } catch (err) {
    console.error('Erro no middleware de autenticação:', err);

    let errorMsg = 'Token inválido';
    if (err.name === 'TokenExpiredError') errorMsg = 'Token expirado';
    if (err.name === 'JsonWebTokenError') errorMsg = 'Token malformado';

    res.status(401).json({
      success: false,
      error: errorMsg
    });
  }
};
