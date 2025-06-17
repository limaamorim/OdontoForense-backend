const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint para buscar coeficientes do modelo IA do Flask
router.get('/modelo/coeficientes', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/api/modelo/coeficientes'); // Chama o Flask
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar coeficientes:', error.message);
    res.status(500).json({ error: 'Erro ao obter coeficientes do modelo IA' });
  }
});

module.exports = router;
