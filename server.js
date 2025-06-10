// server.js unificado
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai'); // Adicionado para IA

// Rotas
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const laudoRoutes = require('./routes/laudoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const evidenciaRoutes = require('./routes/evidenciaRoutes');
const vitimaRoutes = require('./routes/vitimaRoutes');

// Configuração do Express
const app = express();

// =============================================
// 0. CONFIGURAÇÃO DA IA (ANTES DA CONEXÃO COM DB)
// =============================================
const iaConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(iaConfig);

// Disponibiliza a instância da IA para toda a aplicação
app.set('openai', openai);

// =============================================
// 1. CONEXÃO COM O BANCO DE DADOS
// =============================================
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Fernando:nando123@cluster0.tjezx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Aumentado para suportar uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Middleware para disponibilizar serviços globais
app.use((req, res, next) => {
  req.openai = openai; // Disponibiliza a IA para as rotas
  next();
});

// =============================================
// 3. ROTAS
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/laudos', laudoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/vitimas', vitimaRoutes);

// Arquivos estáticos com CORS para imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// =============================================
// 4. ROTA DE STATUS E HEALTH CHECK
// =============================================
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API OdontoForense está funcionando',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    features: {
      iaRelatorios: true, // Indica que a funcionalidade de IA está ativa
      iaVersion: process.env.IA_VERSION || '1.0'
    }
  });
});

// Nova rota de health check para monitoramento
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  const iaStatus = !!process.env.OPENAI_API_KEY;
  
  res.status(dbStatus ? 200 : 503).json({
    db: dbStatus ? 'healthy' : 'unavailable',
    ia: iaStatus ? 'configured' : 'not_configured',
    uptime: process.uptime()
  });
});

// =============================================
// 5. TRATAMENTO DE ERROS
// =============================================
// Error handler para IA
app.use((err, req, res, next) => {
  if (err.message.includes('OpenAI API')) {
    return res.status(503).json({
      error: 'Serviço de IA temporariamente indisponível',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next(err);
});

// Error handler geral
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
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🤖 IA de Relatórios: ${process.env.OPENAI_API_KEY ? 'Ativada' : 'Desativada'}`);
});

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 Desligando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Servidor e conexão com MongoDB encerrados');
      process.exit(0);
    });
  });
});
