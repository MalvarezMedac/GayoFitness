const User = require('../models/Usuario');

// GET /api/stats/today
const getTodayStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const hoy = new Date().toDateString();
    const hoyData = user.progreso.find(
      (p) => new Date(p.fecha).toDateString() === hoy
    );
    return res.json(hoyData ?? { calorias: 0, pasos: 0, minutosActivos: 0, porcentaje: 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/stats/weekly
const getWeeklyStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const entry = user.progreso.find((p) => new Date(p.fecha).toDateString() === dStr);
      result.push({
        fecha:    d.toISOString().split('T')[0],
        progress: entry?.porcentaje     ?? 0,
        calorias: entry?.calorias       ?? 0,
        pasos:    entry?.pasos          ?? 0,
        minutos:  entry?.minutosActivos ?? 0,
      });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getTodayStats, getWeeklyStats };
