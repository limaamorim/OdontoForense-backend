const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const VitimaSchema = new mongoose.Schema({
  nic: {
    type: String,
    required: true,
    unique: true
  },
  nome: {
    type: String
  },
  genero: {
    type: String,
    enum: ['masculino', 'feminino', 'outro', 'nao informado'],
    required: true
  },
  idade: {
    type: String,
    enum: ['bebe', 'crianca', 'adolescente', 'adulta', 'idosa', 'nao_informado']
  },
  corEtnia: {
    type: String
  },
  caso: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caso'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Vitima', VitimaSchema);
