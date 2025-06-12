require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const OpenAI = require('openai');

// Rotas
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const laudoRoutes = require('./routes/laudoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const evidenciaRoutes = require('./routes/evidenciaRoutes');
const vitimaRoutes = require('./routes/vitimaRoutes');

const app = express();

// =============================================
// 0. CONFIGURAÇÃO DA IA (ANTES DA CONEXÃO COM DB)
// =============================================
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

// Disponibiliza a instância da IA para toda a aplicação
app.set('openai', openai);

// =============================================
// 1. CONEXÃO COM O BANCO DE DADOS
// =============================================
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Fernando:nando123@cluster0.tjezx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex e useFindAndModify são depreciados no mongoose 6.x, podem ser removidos
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
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Middleware para disponibilizar serviços globais
app.use((req, res, next) => {
  req.openai = openai;
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
      iaRelatorios: true,
      iaVersion: process.env.IA_VERSION || '1.0',
    },
  });
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  const iaStatus = !!process.env.OPENAI_API_KEY;

  res.status(dbStatus ? 200 : 503).json({
    db: dbStatus ? 'healthy' : 'unavailable',
    ia: iaStatus ? 'configured' : 'not_configured',
    uptime: process.uptime(),
  });
});

// =============================================
// 5. TRATAMENTO DE ERROS
// =============================================
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('OpenAI API')) {
    return res.status(503).json({
      error: 'Serviço de IA temporariamente indisponível',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error('[ERRO]', err.stack);
  res.status(500).json({
    error: 'Erro interno no servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// =============================================
// 6. INICIALIZAÇÃO DO SERVIDOR
// =============================================
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🤖 IA de Relatórios: ${process.env.OPENROUTER_API_KEY ? 'Ativada' : 'Desativada'}`);

});

// Encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 Desligando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Servidor e conexão com MongoDB encerrados');
      process.exit(0);
    });
  });
});
