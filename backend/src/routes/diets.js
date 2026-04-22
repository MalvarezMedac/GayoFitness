const express = require('express');
const router = express.Router();
const Diet = require('../models/Dieta');

// GET todas las dietas con autor
router.get('/', async (req, res) => {
  const diets = await Diet.find().populate('autor');
  res.json(diets);
});

// POST crear dieta
router.post('/', async (req, res) => {
  try {
    const nuevaDieta = new Diet(req.body);
    await nuevaDieta.save();
    res.status(201).json(nuevaDieta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;