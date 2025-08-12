const express = require('express');
const router = express.Router();
const recorteController = require('../controllers/recorteController');
const upload = require('../utils/uploadConfig');

// Middleware para manejo de errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Error de Multer:', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB' 
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes.' 
      });
    }

    if (err.message === 'El archivo debe ser una imagen') {
      return res.status(400).json({
        message: 'El archivo debe ser una imagen'
      });
    }
    
    if (err.message === 'Unexpected field') {
      return res.status(400).json({ 
        message: 'Campo de archivo inesperado. Use el campo "imagen".' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error al procesar el archivo', 
      error: err.message 
    });
  }
  next();
};

// Rutas GET
router.get('/', recorteController.getAllRecortes);
router.get('/disponibles', recorteController.getRecortesDisponibles);
router.get('/utilizados', recorteController.getRecortesUtilizados);
router.get('/maquina/:maquinaId', recorteController.getRecortesByMaquina);
router.get('/espesor/:espesor', recorteController.getRecortesByEspesor);

// Ruta POST para crear un nuevo recorte
router.post('/', upload.single('imagen'), handleMulterError, recorteController.createRecorte);

// Rutas PUT para actualizar recortes
router.put('/:id/use', recorteController.updateRecorteCantidad);
router.put('/:id', upload.single('imagen'), handleMulterError, recorteController.updateRecorte);

// Ruta DELETE para eliminar un recorte
router.delete('/:id', recorteController.deleteRecorte);

// Ruta de prueba para verificar configuración de archivos
router.post('/test-upload', upload.single('imagen'), handleMulterError, (req, res) => {
  try {
    console.log('=== TEST UPLOAD ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    
    if (!req.file) {
      return res.json({ 
        message: 'Test exitoso - Sin archivo', 
        environment: process.env.NODE_ENV,
        multerConfig: process.env.NODE_ENV === 'production' ? 'memory' : 'disk'
      });
    }
    
    res.json({ 
      message: 'Test exitoso - Con archivo', 
      environment: process.env.NODE_ENV,
      multerConfig: process.env.NODE_ENV === 'production' ? 'memory' : 'disk',
      file: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        hasPath: !!req.file.path
      }
    });
  } catch (error) {
    console.error('Error en test-upload:', error);
    res.status(500).json({ 
      message: 'Error en test de upload', 
      error: error.message 
    });
  }
});

module.exports = router;
