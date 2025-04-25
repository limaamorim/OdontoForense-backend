const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/db');  // Verifique se a chave está correta
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verificar se o usuário existe no banco
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      console.log('Usuário não encontrado para o email:', email);
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    console.log('Usuário encontrado:', usuario.email);

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      console.log('Conta desativada para o usuário:', email);
      return res.status(403).json({ msg: 'Conta desativada. Contate o administrador.' });
    }

    // Verificar se a senha está correta
    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) {
      console.log('Senha não corresponde para o usuário:', email);
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    console.log('Senha válida para o usuário:', email);

    // Gerar o JWT
    const payload = {
      usuario: {
        id: usuario.id,
        tipo: usuario.tipo
      }
    };

    jwt.sign(
      payload,
      config.secretOrKey,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.log('Erro ao gerar token:', err);
          throw err;
        }
        console.log('Token gerado com sucesso para o usuário:', email);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Erro no servidor:', err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');
    res.json(usuario);
  } catch (err) {
    console.error('Erro no servidor ao buscar usuário:', err.message);
    res.status(500).send('Erro no servidor');
  }
};
