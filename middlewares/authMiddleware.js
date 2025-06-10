const jwt = require('jsonwebtoken');
const config = require('../config/db');
const Usuario = require('../models/Usuario');

module.exports = async function(req, res, next) {
  // 1. Extração do Token (mais robusta)
  let token = req.header('x-auth-token') || 
              req.cookies?.jwt || 
              req.query?.token;

  // Verifica o header Authorization se não encontrou ainda
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'NO_TOKEN_PROVIDED',
      error: 'Token não encontrado, autorização negada',
      docs: process.env.API_DOCS_URL + '/erros/autenticacao'
    });
  }

  try {
    // 2. Verificação do Token
    const decoded = jwt.verify(token, config.secretOrKey, {
      algorithms: ['HS256'],
      ignoreExpiration: false
    });

    // 3. Busca do Usuário (com cache opcional)
    const usuario = await Usuario.findById(decoded.usuario.id)
      .select('-senha -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!usuario) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'Usuário não encontrado ou desativado'
      });
    }

    // 4. Verificação de conta ativa
    if (!usuario.ativo) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        error: 'Esta conta está desativada'
      });
    }

    // 5. Armazenamento no request
    req.usuario = {
      id: usuario._id,
      tipo: usuario.tipo?.toLowerCase(),
      permissoes: usuario.permissoes || [],
      email: usuario.email,
      nome: usuario.nome
    };

    // 6. Log de auditoria (opcional)
    if (process.env.AUDIT_AUTH === 'true') {
      console.log(`[AUTH] ${usuario.tipo} ${usuario.email} acessou ${req.method} ${req.path}`);
    }

    next();
  } catch (err) {
    // 7. Tratamento de erros detalhado
    console.error('[AUTH ERROR]', err.stack);

    const errorMap = {
      TokenExpiredError: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
        status: 401
      },
      JsonWebTokenError: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
        status: 401
      },
      NotBeforeError: {
        code: 'TOKEN_NOT_ACTIVE',
        message: 'Token não está ativo ainda',
        status: 401
      }
    };

    const errorInfo = errorMap[err.name] || { 
      code: 'AUTH_ERROR', 
      message: 'Erro de autenticação', 
      status: 500 
    };

    res.status(errorInfo.status).json({
      success: false,
      code: errorInfo.code,
      error: errorInfo.message,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
