const express = require('express');
const router = express.Router();
const Product = require('../models/Producto');

// GET todos los productos
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST crear producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;