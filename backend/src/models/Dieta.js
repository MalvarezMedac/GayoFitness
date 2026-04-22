const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comidas: [{ nombre: String, calorias: Number, macros: Object }],
  fechaCreacion: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Diet', dietSchema);