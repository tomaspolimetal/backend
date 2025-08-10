const express = require('express');
const router = express.Router();
const recorteController = require('../controllers/recorteController');
const upload = require('../utils/uploadConfig');

// Rutas GET
router.get('/', recorteController.getAllRecortes);
router.get('/disponibles', recorteController.getRecortesDisponibles);
router.get('/utilizados', recorteController.getRecortesUtilizados);
router.get('/maquina/:maquinaId', recorteController.getRecortesByMaquina);
router.get('/espesor/:espesor', recorteController.getRecortesByEspesor);

// Ruta POST para crear un nuevo recorte
router.post('/', upload.single('imagen'), recorteController.createRecorte);

// Rutas PUT para actualizar recortes
router.put('/:id/use', recorteController.updateRecorteCantidad);
router.put('/:id', upload.single('imagen'), recorteController.updateRecorte);

// Ruta DELETE para eliminar un recorte
router.delete('/:id', recorteController.deleteRecorte);

module.exports = router;
