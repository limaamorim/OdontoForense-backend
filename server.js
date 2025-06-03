// server.js unificado
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Rotas
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const laudoRoutes = require('./routes/laudoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const evidenciaRoutes = require('./routes/evidenciaRoutes');
const vitimaRoutes = require('./routes/vitimaRoutes'); // <-- nova rota adicionada

// Configuração do Express
const app = express();

// =============================================
// 1. CONEXÃO COM O BANCO DE DADOS
// =============================================
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/odontoforense', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB conectado com sucesso'))
  .catch(err => {
    console.error('❌ Falha na conexão com MongoDB:', err);
    process.exit(1);
  });

mongoose.connection.on('connected', () => {
  console.log(`📊 Banco de dados: ${mongoose.connection.db.databaseName}`);
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Erro na conexão com MongoDB:', err);
});

// =============================================
// 2. MIDDLEWARES
// =============================================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// =============================================
// 3. ROTAS
// =============================================
app.use('/api/auth', authRoutes);           // Autenticação
app.use('/api/casos', casoRoutes);          // Casos
app.use('/api/laudos', laudoRoutes);        // Laudos
app.use('/api/usuarios', usuarioRoutes);    // Usuários
app.use('/api/relatorios', relatorioRoutes); // Relatórios
app.use('/api/evidencias', evidenciaRoutes); // Evidências
app.use('/api/vitimas', vitimaRoutes);      // <-- nova rota de vítimas

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// 4. ROTA DE STATUS
// =============================================
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API OdontoForense está funcionando',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// =============================================
// 5. TRATAMENTO DE ERROS
// =============================================
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============================================
// 6. INICIALIZAÇÃO DO SERVIDOR
// =============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
