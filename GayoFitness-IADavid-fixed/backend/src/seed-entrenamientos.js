/**
 * SEED DE ENTRENAMIENTOS - GayoFitness
 * Ejecutar desde /backend: node src/seed-entrenamientos.js
 */

require('dotenv').config({ path: '.env' });
const mongoose      = require('mongoose');
const Usuario       = require('./models/Usuario');
const Entrenamiento = require('./models/Entrenamiento');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gayofitness';

const EMAILS = [
  'carlos@gayofitness.com',
  'laura@gayofitness.com',
  'marcos@gayofitness.com',
  'sara@gayofitness.com',
  'diego@gayofitness.com',
];

const entrenamientosData = [
  {
    titulo:      'Día de pecho y tríceps',
    categoria:   'Hipertrofia',
    dificultad:  'Intermedio',
    duracion:    60,
    descripcion: 'Rutina clásica de empuje. Combina press con ejercicios de aislamiento para máximo volumen muscular.',
    imagen:      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80&auto=format&fit=crop',
    autorNombre: 'Carlos Ruiz',
    ejercicios: [
      { nombre: 'Press de banca plano',          series: 4, reps: '8-10',    descanso: '90s',  notas: 'Controla la bajada en 3 segundos' },
      { nombre: 'Press inclinado con mancuernas', series: 3, reps: '10-12',   descanso: '75s',  notas: '' },
      { nombre: 'Aperturas en polea baja',         series: 3, reps: '12-15',   descanso: '60s',  notas: 'Enfócate en la contracción' },
      { nombre: 'Fondos en paralelas',             series: 3, reps: 'Al fallo',descanso: '90s',  notas: 'Inclínate hacia adelante para pecho' },
      { nombre: 'Extensiones de tríceps en polea', series: 3, reps: '12',      descanso: '60s',  notas: '' },
    ],
  },
  {
    titulo:      'HIIT Cardio Quema grasa',
    categoria:   'Cardio',
    dificultad:  'Avanzado',
    duracion:    30,
    descripcion: 'Entrenamiento de alta intensidad de 30 minutos. Alterna 40s de trabajo y 20s de descanso durante 6 rondas.',
    imagen:      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=80&auto=format&fit=crop',
    autorNombre: 'Laura Gómez',
    ejercicios: [
      { nombre: 'Burpees',          series: 6, reps: '40s', descanso: '20s', notas: 'Máxima intensidad' },
      { nombre: 'Mountain climbers',series: 6, reps: '40s', descanso: '20s', notas: '' },
      { nombre: 'Saltos al cajón',  series: 6, reps: '40s', descanso: '20s', notas: 'Aterriza con rodillas semiflexionadas' },
      { nombre: 'Sprint en sitio',  series: 6, reps: '40s', descanso: '20s', notas: '' },
      { nombre: 'Jumping jacks',    series: 6, reps: '40s', descanso: '20s', notas: 'Ejercicio de vuelta a la calma' },
    ],
  },
  {
    titulo:      'Full Body para principiantes',
    categoria:   'Full Body',
    dificultad:  'Principiante',
    duracion:    45,
    descripcion: 'Rutina completa para quien empieza. Trabaja todos los grupos musculares con ejercicios básicos y seguros.',
    imagen:      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&auto=format&fit=crop',
    autorNombre: 'Marcos Vidal',
    ejercicios: [
      { nombre: 'Sentadilla con peso corporal', series: 3, reps: '15',  descanso: '60s', notas: 'Espalda recta, rodillas no pasan los pies' },
      { nombre: 'Flexiones de rodillas',        series: 3, reps: '10',  descanso: '60s', notas: 'Perfecto para empezar' },
      { nombre: 'Remo con mancuerna',           series: 3, reps: '12',  descanso: '60s', notas: 'Cada brazo' },
      { nombre: 'Plancha',                      series: 3, reps: '30s', descanso: '45s', notas: 'Mantén el core apretado' },
      { nombre: 'Peso muerto rumano',           series: 3, reps: '12',  descanso: '75s', notas: 'Usa poco peso al principio' },
    ],
  },
  {
    titulo:      'Yoga y movilidad activa',
    categoria:   'Flexibilidad',
    dificultad:  'Principiante',
    duracion:    40,
    descripcion: 'Sesión de movilidad y flexibilidad. Ideal como día de descanso activo o calentamiento previo al entreno.',
    imagen:      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&auto=format&fit=crop',
    autorNombre: 'Sara Blanco',
    ejercicios: [
      { nombre: 'Saludo al sol',                     series: 3, reps: '5 ciclos',      descanso: '30s', notas: 'Respiración controlada' },
      { nombre: 'Paloma (apertura cadera)',           series: 2, reps: '60s cada lado', descanso: '30s', notas: 'Sin forzar' },
      { nombre: 'Estiramiento de isquiotibiales',    series: 3, reps: '45s',           descanso: '20s', notas: '' },
      { nombre: 'Cat-Cow (columna)',                 series: 2, reps: '10 repeticiones',descanso: '20s', notas: 'Sincroniza con la respiración' },
      { nombre: 'Torsión espinal tumbado',           series: 2, reps: '45s cada lado', descanso: '20s', notas: 'Relaja los hombros en el suelo' },
    ],
  },
  {
    titulo:      'Rutina de espalda y bíceps',
    categoria:   'Fuerza',
    dificultad:  'Avanzado',
    duracion:    65,
    descripcion: 'Sesión enfocada en tracción. Dominadas, remos y curl para construir una espalda ancha y brazos fuertes.',
    imagen:      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80&auto=format&fit=crop',
    autorNombre: 'Diego Torres',
    ejercicios: [
      { nombre: 'Dominadas pronadas',            series: 4, reps: '6-8',  descanso: '120s', notas: 'Agarre ancho, baja completamente' },
      { nombre: 'Remo con barra',                series: 4, reps: '8-10', descanso: '90s',  notas: 'Tira hacia el ombligo' },
      { nombre: 'Jalón al pecho en polea',       series: 3, reps: '10-12',descanso: '75s',  notas: '' },
      { nombre: 'Remo en polea baja',            series: 3, reps: '12',   descanso: '60s',  notas: 'Pecho fuera, no redondees la espalda' },
      { nombre: 'Curl de bíceps con barra',      series: 3, reps: '10',   descanso: '75s',  notas: '' },
      { nombre: 'Curl martillo alternado',       series: 3, reps: '12',   descanso: '60s',  notas: 'Trabaja el braquial' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const usuarios = await Usuario.find({ email: { $in: EMAILS } });
    if (usuarios.length === 0) {
      console.log('⚠️  No se encontraron usuarios. Ejecuta primero: node src/seed-recetas.js');
      process.exit(1);
    }

    const userMap = {};
    usuarios.forEach(function(u) { userMap[u.name] = u; });

    await Entrenamiento.deleteMany({ autorNombre: { $in: entrenamientosData.map(function(e) { return e.autorNombre; }) } });

    for (var i = 0; i < entrenamientosData.length; i++) {
      var data    = entrenamientosData[i];
      var usuario = userMap[data.autorNombre];
      var e = await Entrenamiento.create({
        titulo:      data.titulo,
        categoria:   data.categoria,
        dificultad:  data.dificultad,
        duracion:    data.duracion,
        descripcion: data.descripcion,
        imagen:      data.imagen,
        autorNombre: data.autorNombre,
        ejercicios:  data.ejercicios,
        autor:       usuario ? usuario._id : null,
      });
      console.log('🏋️  Creado: ' + e.titulo + ' (por ' + e.autorNombre + ')');
    }

    await mongoose.disconnect();
    console.log('\n✅ Seed de entrenamientos completado!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
