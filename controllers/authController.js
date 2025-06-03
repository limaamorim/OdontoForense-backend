const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth'); // Corrigido aqui
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    if (!usuario.ativo) {
      return res.status(403).json({ msg: 'Conta desativada. Contate o administrador.' });
    }

    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const payload = {
      usuario: {
        id: usuario.id,
        tipo: usuario.tipo?.toLowerCase()
      }
    };

    jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
      (err, token) => {
        if (err) {
          console.error('Erro ao gerar token:', err);
          return res.status(500).json({ msg: 'Erro ao gerar token' });
        }

        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Erro no servidor:', err.message);
    res.status(500).json({ msg: 'Erro no servidor' }); // Corrigido para JSON
  }
};

exports.getUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error('Erro no servidor ao buscar usuário:', err.message);
    res.status(500).json({ msg: 'Erro no servidor' }); // Corrigido para JSON
  }
};
