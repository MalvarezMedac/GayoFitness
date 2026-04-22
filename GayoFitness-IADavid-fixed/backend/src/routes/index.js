const express = require('express');
const router  = express.Router();

const { register, login }                             = require('../controllers/auth.controller');
const { getProfile, updateProfile, saveProgress, deleteAccount } = require('../controllers/user.controller');
const { getRecommendations }                          = require('../controllers/recomendations.controller');
const { getTodayStats, getWeeklyStats }               = require('../controllers/stats.controller');
const { authMiddleware }                              = require('../middleware/auth');

const dietsRoutes          = require('./diets.js');
const productsRoutes       = require('./products.js');
const recetasRoutes        = require('./recetas.js');
const entrenamientosRoutes = require('./entrenamientos.js');

// Auth (sin token)
router.post('/auth/register', register);
router.post('/auth/login',    login);

// Perfil (con token)
router.get('/auth/profile',    authMiddleware, getProfile);
router.put('/auth/profile',    authMiddleware, updateProfile);
router.delete('/auth/profile', authMiddleware, deleteAccount);

// Stats (con token)
router.get('/stats/today',  authMiddleware, getTodayStats);
router.get('/stats/weekly', authMiddleware, getWeeklyStats);
router.post('/stats/today', authMiddleware, saveProgress);

// Recomendaciones (con token)
router.get('/recommendations', authMiddleware, getRecommendations);

// Otras rutas
router.use('/dietas',          dietsRoutes);
router.use('/products',        productsRoutes);
router.use('/recetas',         recetasRoutes);
router.use('/entrenamientos',  entrenamientosRoutes);

router.get('/', (req, res) => res.json({ status: 'API GayoFitness 🚀' }));

module.exports = router;
