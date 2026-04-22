const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  // Datos físicos
  peso:   { type: Number, default: null },  // kg
  altura: { type: Number, default: null },  // cm
  edad:   { type: Number, default: null },

  // Objetivo fitness
  goal: {
    type: String,
    enum: ['perdida_peso', 'ganar_musculo', 'resistencia'],
    default: 'ganar_musculo',
  },

  avatar: { type: String, default: '' },
  bio:    { type: String, default: '' },

  // Progreso diario
  progreso: [
    {
      fecha:          { type: Date, default: Date.now },
      calorias:       { type: Number, default: 0 },
      pasos:          { type: Number, default: 0 },
      minutosActivos: { type: Number, default: 0 },
      porcentaje:     { type: Number, default: 0 },
    }
  ],

  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
