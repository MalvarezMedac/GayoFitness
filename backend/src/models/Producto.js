const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  precio:      { type: Number, required: true },
  categoria:   { type: String, enum: ['Suplementos', 'Equipamiento', 'Ropa'], required: true },
  imagen:      { type: String, default: '' },
  descripcion: { type: String, default: '' },
  puntuacion:  { type: Number, min: 1, max: 10, default: 5 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
