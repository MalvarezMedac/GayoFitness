const express = require('express');
const router = express.Router();

router.get('/:goal', (req, res) => {
  const goal = req.params.goal;

  let data = [];

  if (goal === "musculo") {
    data = [
      { title: "HIIT Cardio Intenso", type: "Entrenamiento", kcal: "420 kcal", emoji: "🏋️" },
      { title: "Pollo con arroz", type: "Receta", kcal: "600 kcal", emoji: "🍗" }
    ];
  } else if (goal === "perder") {
    data = [
      { title: "Cardio suave", type: "Entrenamiento", kcal: "300 kcal", emoji: "🏃" },
      { title: "Ensalada", type: "Receta", kcal: "200 kcal", emoji: "🥗" }
    ];
  }

  res.json(data);
});

module.exports = router;
// models/Recommendation.ts
import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  type:   { type: String, enum: ['Entrenamiento', 'Nutrición', 'Flexibilidad'] },
  kcal:   { type: String },
  emoji:  { type: String },
  goals:  [{ 
    type: String, 
    enum: ['perdida_peso', 'ganar_musculo', 'resistencia'] 
  }], // un item puede aparecer en varios objetivos
});

export default mongoose.model('Recommendation', RecommendationSchema);