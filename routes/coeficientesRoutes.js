const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint que chama o Flask para pegar os coeficientes
router.get('/modelo/coeficientes', async (req, res) => {
  try {
    const response = await axios.get('https://odontoforense-backend.onrender.com/api/modelo/coeficientes');
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar coeficientes:', error.message);
    res.status(500).json({ error: 'Erro ao obter coeficientes do modelo IA' });
  }
});

module.exports = router;
