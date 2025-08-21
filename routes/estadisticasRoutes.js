// estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const {
  getEstadisticasPorMaquina,
  getResumenEstadisticas,
  getEstadisticasEnTiempoReal
} = require('../controllers/estadisticasController');

// GET /api/estadisticas/maquina/:maquinaId - Obtener estadísticas de una máquina específica
// Query params opcionales: ultimoMes=true, fechaInicio, fechaFin
router.get('/maquina/:maquinaId', getEstadisticasPorMaquina);

// GET /api/estadisticas/resumen - Obtener resumen de estadísticas de todas las máquinas
// Query params opcionales: ultimoMes=true, fechaInicio, fechaFin
router.get('/resumen', getResumenEstadisticas);

// GET /api/estadisticas/tiempo-real - Obtener estadísticas en tiempo real para dashboard
router.get('/tiempo-real', getEstadisticasEnTiempoReal);

module.exports = router;