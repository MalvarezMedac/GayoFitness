const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    req.userId = decoded.id;

    next();
  } catch (err) {
    console.log("ERROR TOKEN:", err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { authMiddleware };