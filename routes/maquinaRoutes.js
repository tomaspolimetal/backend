const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquinaController');

// Obtener todas las máquinas
router.get('/', maquinaController.getAllMaquinas);

// Crear una nueva máquina
router.post('/', maquinaController.createMaquina);

module.exports = router;
