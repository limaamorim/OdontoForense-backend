const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const EvidenciaSchema = new mongoose.Schema({
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caso',
    required: true
  },
  tipo: {
    type: String,
    enum: ['foto', 'documento', 'radiografia', 'modelo_dental', 'outros'],
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  caminhoArquivo: {
    type: String,
    required: true
  },
  dataUpload: {
    type: Date,
    default: Date.now
  },
  uploadPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
});

module.exports = mongoose.model('Evidencia', EvidenciaSchema);
