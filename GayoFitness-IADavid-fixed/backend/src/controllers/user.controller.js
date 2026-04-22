const User = require('../models/Usuario');

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user.toPublic());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'peso', 'altura', 'edad', 'goal', 'avatar', 'bio'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user.toPublic());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/stats/today
const saveProgress = async (req, res) => {
  try {
    const { calorias, pasos, minutosActivos, porcentaje } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const idx = user.progreso.findIndex(
      (p) => new Date(p.fecha).toDateString() === hoy.toDateString()
    );

    if (idx >= 0) {
      if (calorias       !== undefined) user.progreso[idx].calorias       = calorias;
      if (pasos          !== undefined) user.progreso[idx].pasos          = pasos;
      if (minutosActivos !== undefined) user.progreso[idx].minutosActivos = minutosActivos;
      if (porcentaje     !== undefined) user.progreso[idx].porcentaje     = porcentaje;
    } else {
      user.progreso.push({ fecha: hoy, calorias, pasos, minutosActivos, porcentaje });
    }

    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/auth/profile
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ ok: true, message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile, saveProgress, deleteAccount };
