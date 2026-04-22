const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado ✅'))
  .catch(err => console.error('Error MongoDB:', err));

const routes = require('./src/routes/index.js');
app.use('/api', routes);

app.get('/', (req, res) => res.json({ status: 'Backend GayoFitness 🚀' }));

const PORT = process.env.PORT || 3000;
// 0.0.0.0 para que el móvil pueda conectar por IP local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en http://0.0.0.0:${PORT}`);
});
