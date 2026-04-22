/**
 * SEED DE RECETAS - GayoFitness
 * Ejecutar: node src/seed-recetas.js
 * (desde la carpeta /backend con el servidor corriendo)
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const Usuario  = require('./models/Usuario');
const Receta   = require('./models/Receta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gayofitness';

// 5 usuarios ficticios
const usuariosData = [
  { name: 'Carlos Ruiz',    email: 'carlos@gayofitness.com',  password: '123456', goal: 'ganar_musculo', peso: 80, altura: 178, edad: 26 },
  { name: 'Laura Gómez',   email: 'laura@gayofitness.com',   password: '123456', goal: 'perdida_peso',  peso: 62, altura: 165, edad: 29 },
  { name: 'Marcos Vidal',  email: 'marcos@gayofitness.com',  password: '123456', goal: 'resistencia',   peso: 72, altura: 175, edad: 32 },
  { name: 'Sara Blanco',   email: 'sara@gayofitness.com',    password: '123456', goal: 'perdida_peso',  peso: 58, altura: 162, edad: 24 },
  { name: 'Diego Torres',  email: 'diego@gayofitness.com',   password: '123456', goal: 'ganar_musculo', peso: 85, altura: 182, edad: 28 },
];

// 5 recetas (una por usuario)
const recetasData = [
  {
    titulo:        'Batido de proteínas con avena',
    categoria:     'Batido',
    calorias:      420,
    imagen:        'https://images.unsplash.com/photo-1622818426197-d54f85b88690?w=600&q=80&auto=format&fit=crop',
    ingredientes:  ['1 scoop whey proteína vainilla', '200ml leche de avena', '1 plátano maduro', '50g avena', '1 cucharada mantequilla de cacahuete', 'Hielo al gusto'],
    instrucciones: 'Echa todos los ingredientes en la batidora. Tritura durante 45 segundos hasta obtener una textura cremosa. Sirve frío inmediatamente.',
    autorNombre:   'Carlos Ruiz',
  },
  {
    titulo:        'Bowl de pollo con quinoa y verduras',
    categoria:     'Almuerzo',
    calorias:      540,
    imagen:        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&auto=format&fit=crop',
    ingredientes:  ['150g pechuga de pollo', '80g quinoa', '1 aguacate', '100g espinacas frescas', '1 tomate cherry', '2 cucharadas aceite de oliva', 'Limón, sal y pimienta'],
    instrucciones: 'Cuece la quinoa 15 min. A la vez, cocina el pollo a la plancha con sal y pimienta. Monta el bowl con la quinoa de base, añade el pollo, el aguacate en láminas, las espinacas y los tomates. Aliña con limón y aceite.',
    autorNombre:   'Laura Gómez',
  },
  {
    titulo:        'Tostadas de aguacate con huevo poché',
    categoria:     'Desayuno',
    calorias:      380,
    imagen:        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80&auto=format&fit=crop',
    ingredientes:  ['2 rebanadas pan integral', '1 aguacate maduro', '2 huevos', '1 limón', 'Semillas de sésamo', 'Sal, pimienta y chile en polvo'],
    instrucciones: 'Tuesta el pan. Aplasta el aguacate con limón, sal y chile. Escalfa los huevos 3 min en agua con vinagre. Unta el aguacate sobre las tostadas, coloca el huevo encima y decora con sésamo.',
    autorNombre:   'Marcos Vidal',
  },
  {
    titulo:        'Snack de requesón con frutas del bosque',
    categoria:     'Snack',
    calorias:      210,
    imagen:        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80&auto=format&fit=crop',
    ingredientes:  ['200g requesón 0%', '100g arándanos frescos', '50g frambuesas', '1 cucharada miel', '10g nueces troceadas', 'Canela al gusto'],
    instrucciones: 'Sirve el requesón en un bol. Añade las frutas del bosque por encima. Vierte la miel, las nueces y espolvorea canela. Listo en menos de 2 minutos.',
    autorNombre:   'Sara Blanco',
  },
  {
    titulo:        'Salmón al horno con patata dulce',
    categoria:     'Cena',
    calorias:      620,
    imagen:        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80&auto=format&fit=crop',
    ingredientes:  ['200g filete de salmón', '1 boniato mediano', '2 dientes ajo', 'Romero fresco', '2 cucharadas aceite de oliva', 'Sal, pimienta y pimentón dulce'],
    instrucciones: 'Precalienta el horno a 200°C. Corta el boniato en rodajas, alíñalas con aceite, pimentón y sal. Hornea 20 min. Pon el salmón con ajo, romero y aceite, hornea 12-15 min más. Sirve juntos.',
    autorNombre:   'Diego Torres',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear o recuperar usuarios ficticios
    const usuariosCreados = [];
    for (const u of usuariosData) {
      let user = await Usuario.findOne({ email: u.email });
      if (!user) {
        const hashed = await bcrypt.hash(u.password, 10);
        user = await Usuario.create({ ...u, password: hashed });
        console.log(`👤 Usuario creado: ${u.name}`);
      } else {
        console.log(`👤 Usuario ya existe: ${u.name}`);
      }
      usuariosCreados.push(user);
    }

    // Borrar recetas del seed anterior e insertar las nuevas
    await Receta.deleteMany({ autorNombre: { $in: usuariosData.map(u => u.name) } });

    for (let i = 0; i < recetasData.length; i++) {
      const receta = await Receta.create({
        ...recetasData[i],
        autor: usuariosCreados[i]._id,
      });
      console.log(`🍽️  Receta creada: ${receta.titulo} (por ${receta.autorNombre})`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Seed de recetas completado!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
