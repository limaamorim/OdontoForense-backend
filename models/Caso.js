const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CasoSchema = new mongoose.Schema({
  numeroCaso: {
    type: String,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Aberto', 'Em andamento', 'Fechado']
  },
  peritoResponsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  dataAbertura: {
    type: Date,
    default: Date.now
  },
  dataFechamento: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.dataAbertura;
      },
      message: 'Data de fechamento deve ser posterior à data de abertura'
    }
  },
  observacoes: {
    type: String
  },
  dataOcorrido: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Data do ocorrido não pode ser no futuro'
    }
  },
  local: {
    type: String,
    required: true 
  },
  vitimas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vitima'
  }],
  evidencias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidencia'
  }]
});

CasoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Caso', CasoSchema);
