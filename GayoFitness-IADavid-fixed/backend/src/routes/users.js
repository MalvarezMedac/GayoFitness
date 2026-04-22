const express = require('express');
const router = express.Router();

const User = require('../models/Usuario');

// 🔹 GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔹 POST crear usuario
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 👇 adaptamos a tu modelo (nombre en vez de name)
    const newUser = new User({
      nombre: name,
      email,
      password,
      avatar: "",
      bio: ""
    });

    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.nombre, // 👈 devolvemos normalizado para frontend
      email: newUser.email
    });

  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;