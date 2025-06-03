require('dotenv').config(); // Carrega as variáveis do .env

module.exports = {
  // Configurações de autenticação
  jwt: {
    secret: process.env.SECRET_OR_KEY || 'segredoDesenvolvimento', // Chave para assinar tokens
    expiresIn: process.env.JWT_EXPIRES || '5h', // Tempo de expiração do token
    algorithm: 'HS256' // Algoritmo de criptografia
  },

  // Níveis de acesso (roles)
  roles: {
    assistente: 'assistente',
    perito: 'perito',
    administrador: 'administrador'
  },

  // Configurações de senha
  password: {
    saltRounds: 10 // Custos do bcrypt para hash de senha
  }
};
