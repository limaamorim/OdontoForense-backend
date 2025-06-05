const mongoose = require('mongoose');

const EvidenciaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tipo: {
    type: String,
    enum: ['foto', 'documento', 'radiografia', 'modelo_dental', 'outros'],
    required: true
  },
  imagem: {
    type: String,
    required: true
  },
  caso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caso',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evidencia', EvidenciaSchema);
