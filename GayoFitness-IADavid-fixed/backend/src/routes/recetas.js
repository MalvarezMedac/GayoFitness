const express  = require('express');
const router   = express.Router();
const Receta   = require('../models/Receta');
const { authMiddleware } = require('../middleware/auth');

// GET todas las recetas (público)
router.get('/', async (req, res) => {
  try {
    const recetas = await Receta.find().sort({ createdAt: -1 });
    res.json(recetas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recetas del usuario autenticado
router.get('/mias', authMiddleware, async (req, res) => {
  try {
    const recetas = await Receta.find({ autor: req.userId }).sort({ createdAt: -1 });
    res.json(recetas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear receta (requiere auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/Usuario');
    const user = await User.findById(req.userId);
    const receta = new Receta({
      ...req.body,
      autor:       req.userId,
      autorNombre: user?.name ?? 'Anónimo',
    });
    await receta.save();
    res.status(201).json(receta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE receta propia
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const receta = await Receta.findOne({ _id: req.params.id, autor: req.userId });
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada o no autorizado' });
    await receta.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
