/**
 * SEED DE PRODUCTOS - GayoFitness
 * Ejecutar: node src/seed-productos.js
 * (desde la carpeta /backend con el servidor parado o en paralelo)
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Product  = require('./models/Producto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gayofitness';

const productos = [
  {
    nombre:      'Whey Protein Gold 2kg',
    precio:      44.99,
    categoria:   'Suplementos',
    descripcion: 'Proteína de suero de alta calidad con 24g de proteína por toma. Sabor chocolate suave, ideal para recuperación muscular post-entreno.',
    puntuacion:  9,
    imagen:      'https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?w=400&q=80&auto=format&fit=crop',
  },
  {
    nombre:      'Creatina Monohidrato 500g',
    precio:      24.99,
    categoria:   'Suplementos',
    descripcion: 'Creatina monohidrato pura micronizada. Mejora la fuerza, la potencia y el rendimiento en entrenamientos de alta intensidad. Sin aditivos.',
    puntuacion:  10,
    imagen:      'https://images.unsplash.com/photo-1704650311190-7eeb9c4f6e11?w=400&q=80&auto=format&fit=crop',
  },
  {
    nombre:      'Mancuernas Ajustables 2-24kg',
    precio:      89.99,
    categoria:   'Equipamiento',
    descripcion: 'Set de mancuernas ajustables de 2 a 24 kg. Sustituyen a 15 pares de mancuernas distintas. Diseño compacto, perfectas para entrenamiento en casa.',
    puntuacion:  8,
    imagen:      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80&auto=format&fit=crop',
  },
  {
    nombre:      'Bandas Elásticas Pack 5 niveles',
    precio:      19.99,
    categoria:   'Equipamiento',
    descripcion: 'Pack de 5 bandas de resistencia de diferentes niveles (5 a 45 kg). Ideales para calentar, tonificar y rehabilitación. Material látex natural duradero.',
    puntuacion:  7,
    imagen:      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80&auto=format&fit=crop',
  },
  {
    nombre:      'Camiseta Dry-Fit Pro',
    precio:      29.99,
    categoria:   'Ropa',
    descripcion: 'Camiseta técnica de alto rendimiento con tejido transpirable y secado ultra-rápido. Diseño ergonómico que acompaña cada movimiento sin rozaduras.',
    puntuacion:  8,
    imagen:      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80&auto=format&fit=crop',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Borra los productos existentes antes de insertar
    await Product.deleteMany({});
    console.log('🗑️  Productos anteriores eliminados');

    const insertados = await Product.insertMany(productos);
    console.log(`✅ ${insertados.length} productos insertados:`);
    insertados.forEach(p => console.log(`   - ${p.nombre} (${p.categoria}) → ${p._id}`));

    await mongoose.disconnect();
    console.log('✅ Desconectado. ¡Seed completado!');
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  }
}

seed();
