const mongoose = require('mongoose');

const ejercicioSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  series:   { type: Number, default: 3 },
  reps:     { type: String, default: '10' }, // puede ser "10-12" o "al fallo"
  descanso: { type: String, default: '60s' },
  notas:    { type: String, default: '' },
});

const entrenamientoSchema = new mongoose.Schema({
  titulo:      { type: String, required: true },
  imagen:      { type: String, default: '' },
  descripcion: { type: String, default: '' },
  categoria:   { type: String, enum: ['Fuerza','Cardio','Hipertrofia','Resistencia','Flexibilidad','Full Body'], default: 'Fuerza' },
  duracion:    { type: Number, default: 45 },   // minutos
  dificultad:  { type: String, enum: ['Principiante','Intermedio','Avanzado'], default: 'Intermedio' },
  ejercicios:  [ejercicioSchema],
  autor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  autorNombre: { type: String, default: 'Anónimo' },
  likes:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Entrenamiento', entrenamientoSchema);
