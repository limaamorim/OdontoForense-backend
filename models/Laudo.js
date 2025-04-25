const mongoose = require('mongoose');

const LaudoSchema = new mongoose.Schema({
  evidencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidencia',
    required: true
  },
  perito: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  conclusao: {
    type: String,
    required: true
  },
  dataEmissao: {
    type: Date,
    default: Date.now
  },
  revisoes: [{
    revisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    dataRevisao: Date,
    observacoes: String
  }],
  status: {
    type: String,
    enum: ['rascunho', 'finalizado', 'assinado', 'revisado'],
    default: 'rascunho'
  }
});

module.exports = mongoose.model('Laudo', LaudoSchema);