const User = require('../models/Usuario');

const RECS = {
  ganar_musculo: [
    { title: 'HIIT Cardio Intenso',  type: 'Entrenamiento', kcal: '420 kcal', emoji: '🏋️' },
    { title: 'Pollo con arroz',       type: 'Nutrición',     kcal: '600 kcal', emoji: '🍗' },
    { title: 'Press de banca',        type: 'Entrenamiento', kcal: '350 kcal', emoji: '💪' },
  ],
  perdida_peso: [
    { title: 'Cardio suave 40min',    type: 'Entrenamiento', kcal: '300 kcal', emoji: '🏃' },
    { title: 'Ensalada mediterránea', type: 'Nutrición',     kcal: '200 kcal', emoji: '🥗' },
    { title: 'Yoga matutino',         type: 'Flexibilidad',  kcal: '150 kcal', emoji: '🧘' },
  ],
  resistencia: [
    { title: 'Carrera 5km',           type: 'Entrenamiento', kcal: '380 kcal', emoji: '🏅' },
    { title: 'Avena con frutas',      type: 'Nutrición',     kcal: '450 kcal', emoji: '🥣' },
    { title: 'Ciclismo 1h',           type: 'Entrenamiento', kcal: '500 kcal', emoji: '🚴' },
  ],
};

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(RECS[user.goal] ?? RECS['ganar_musculo']);
  } catch (err) {
    console.error('ERROR getRecommendations:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecommendations };
