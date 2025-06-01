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
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', 
    required: true
  },
});

module.exports = mongoose.model('Relatorio', RelatorioSchema);