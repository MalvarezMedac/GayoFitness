const mongoose = require('mongoose');

const recetaSchema = new mongoose.Schema({
  titulo:       { type: String, required: true },
  imagen:       { type: String, default: '' },
  calorias:     { type: Number, required: true },
  ingredientes: [{ type: String }],
  instrucciones:{ type: String, default: '' },
  autor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  autorNombre:  { type: String, default: 'Anónimo' },
  categoria:    { type: String, enum: ['Desayuno','Almuerzo','Cena','Snack','Batido'], default: 'Almuerzo' },
  likes:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Receta', recetaSchema);
