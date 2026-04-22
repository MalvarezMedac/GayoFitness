const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, peso, altura, edad, goal } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email y password son obligatorios' });

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      peso:   peso   ?? null,
      altura: altura ?? null,
      edad:   edad   ?? null,
      goal:   goal   || 'ganar_musculo',
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    return res.status(201).json({ token, user: user.toPublic() });

  } catch (err) {
    console.error('ERROR register:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email y password son obligatorios' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ field: 'email', error: 'El correo no está registrado' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ field: 'password', error: 'La contraseña es incorrecta' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, user: user.toPublic() });

  } catch (err) {
    console.error('ERROR login:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
