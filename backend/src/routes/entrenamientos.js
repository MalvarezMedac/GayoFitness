const express = require('express');
const router  = express.Router();
const Entrenamiento = require('../models/Entrenamiento');
const { authMiddleware } = require('../middleware/auth');

// GET todos (público)
router.get('/', async (req, res) => {
  try {
    const lista = await Entrenamiento.find().sort({ createdAt: -1 });
    res.json(lista);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET mis entrenamientos
router.get('/mios', authMiddleware, async (req, res) => {
  try {
    const lista = await Entrenamiento.find({ autor: req.userId }).sort({ createdAt: -1 });
    res.json(lista);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear
router.post('/', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/Usuario');
    const user = await User.findById(req.userId);
    const e = new Entrenamiento({
      ...req.body,
      autor:       req.userId,
      autorNombre: user?.name ?? 'Anónimo',
    });
    await e.save();
    res.status(201).json(e);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE propio
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const e = await Entrenamiento.findOne({ _id: req.params.id, autor: req.userId });
    if (!e) return res.status(404).json({ error: 'No encontrado o no autorizado' });
    await e.deleteOne();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
