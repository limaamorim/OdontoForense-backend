const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const RelatorioSchema = new mongoose.Schema({
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caso', 
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['rascunho', 'finalizado', 'assinado', 'revisado'],
    default: 'rascunho'
  },
  geradoPorIA: {
    type: Boolean,
    default: true
  },
  versaoIA: {
    type: String,
    default: '1.0'
  },
  promptUsado: {
    type: String,
    required: false
  }
});

RelatorioSchema.plugin(mongoosePaginate);

// Agora exporta o model corretamente
module.exports = mongoose.model('Relatorio', RelatorioSchema);
