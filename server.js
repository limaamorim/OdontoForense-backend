require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const usuarioRoutes = require('./routes/usuarioRoutes');
const casoRoutes = require('./routes/casoRoutes');
const evidenciaRoutes = require('./routes/evidenciaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const vitimaRoutes = require('./routes/vitimaRoutes');
const path = require('path');

const app = express();

// 1. CONEXÃO COM BANCO
conectarDB();

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. ROTAS PRINCIPAIS
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/vitimas', vitimaRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. TRATAMENTO DE ERROS
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Fallback para rotas não encontradas (resposta em JSON)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
