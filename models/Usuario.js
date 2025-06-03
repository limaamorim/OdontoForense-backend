const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UsuarioSchema = new mongoose.Schema({
  
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['assistente', 'perito', 'administrador'],
    required: true,
    default: 'assistente'
  },

  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

module.exports = mongoose.model('Usuario', UsuarioSchema);