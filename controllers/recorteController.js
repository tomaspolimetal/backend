const Recorte = require('../models/Recorte');
const Maquina = require('../models/Maquina');
const path = require('path');
const fs = require('fs');

exports.getAllRecortes = async (req, res) => {
  try {
    const { estado } = req.query; // Permitir filtrar por estado via query parameter
    const whereClause = {};
    
    // Si se especifica el estado en la query, agregarlo al filtro
    if (estado !== undefined) {
      whereClause.estado = estado === 'true';
    }
    
    const recortes = await Recorte.findAll({
      where: whereClause,
      include: [{ model: Maquina }],
      order: [['fecha_creacion', 'DESC']] // Ordenar por fecha de creación
    });
    res.json(recortes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los recortes', error: error.message });
  }
};

// Obtener recortes disponibles (estado true)
exports.getRecortesDisponibles = async (req, res) => {
  try {
    const recortes = await Recorte.findAll({
      where: { estado: true },
      include: [{ model: Maquina }],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(recortes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los recortes disponibles', error: error.message });
  }
};

// Obtener recortes utilizados (estado false)
exports.getRecortesUtilizados = async (req, res) => {
  try {
    const recortes = await Recorte.findAll({
      where: { estado: false },
      include: [{ model: Maquina }],
      order: [['fecha_actualizacion', 'DESC']] // Ordenar por fecha de actualización para ver los más recientemente utilizados
    });
    res.json(recortes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los recortes utilizados', error: error.message });
  }
};

// Crear un nuevo recorte
exports.createRecorte = async (req, res) => {
  try {
    console.log('=== DEBUG createRecorte ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? 'File present' : 'No file');
    
    const { largo, ancho, espesor, cantidad, maquinaId, observaciones } = req.body;
    
    // Validar campos requeridos
    if (!largo || !ancho || !espesor || !cantidad || !maquinaId) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos (largo, ancho, espesor, cantidad, maquinaId)' 
      });
    }

    // Verificar si la máquina existe
    const maquina = await Maquina.findByPk(maquinaId);
    if (!maquina) {
      return res.status(404).json({ message: 'Máquina no encontrada' });
    }

    // Procesar la imagen si existe
    let imagenPath = null;
    if (req.file) {
      if (process.env.NODE_ENV === 'production') {
        // En producción, convertir imagen a base64 para almacenar en BD
        const base64Image = req.file.buffer.toString('base64');
        imagenPath = `data:${req.file.mimetype};base64,${base64Image}`;
      } else {
        // En desarrollo, usar ruta del archivo
        imagenPath = '/uploads/' + req.file.filename;
      }
    }

    const recorte = await Recorte.create({
      largo,
      ancho,
      espesor,
      cantidad,
      maquinaId,
      estado: true,
      imagen: imagenPath,
      observaciones
    });

    // Obtener el recorte con la información de la máquina
    const recorteConMaquina = await Recorte.findByPk(recorte.id, {
      include: [{ model: Maquina }]
    });

    // Emitir evento de nuevo recorte
    req.io.emit('newRecorte', recorteConMaquina);
    
    res.status(201).json(recorteConMaquina);
  } catch (error) {
    console.error('Error en createRecorte:', error);
    
    // Manejo específico de errores de Multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB' 
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes.' 
      });
    }
    
    // Error genérico
    res.status(500).json({ 
      message: 'Error al crear el recorte', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getRecortesByMaquina = async (req, res) => {
  try {
    const { maquinaId } = req.params;
    const recortes = await Recorte.findAll({
      where: { maquinaId },
      include: [{ model: Maquina }]
    });
    res.json(recortes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los recortes por máquina', error: error.message });
  }
};

exports.getRecortesByEspesor = async (req, res) => {
  try {
    const { espesor } = req.params;
    const recortes = await Recorte.findAll({
      where: { espesor },
      include: [{ model: Maquina }]
    });
    res.json(recortes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los recortes por espesor', error: error.message });
  }
};

// Actualizar cantidad del recorte
exports.updateRecorteCantidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const recorte = await Recorte.findByPk(id);
    
    if (!recorte) {
      return res.status(404).json({ message: 'Recorte no encontrado' });
    }

    if (cantidad > recorte.cantidad) {
      return res.status(400).json({ 
        message: 'La cantidad a utilizar es mayor que la disponible' 
      });
    }

    const nuevaCantidad = recorte.cantidad - cantidad;
    const nuevoEstado = nuevaCantidad === 0 ? false : true;
    const prevEstado = recorte.estado; // capturamos el estado previo antes de actualizar

    await recorte.update({
      cantidad: nuevaCantidad,
      estado: nuevoEstado,
      fecha_actualizacion: new Date()
    });

    // Obtener el recorte actualizado con la información de la máquina
    const recorteActualizado = await Recorte.findByPk(id, {
      include: [{ model: Maquina }]
    });

    // Emitir eventos específicos según el cambio de estado
    req.io.emit('recorteUpdated', recorteActualizado);
    
    // Si el recorte cambió a estado false (utilizado), emitir evento específico
    if (nuevoEstado === false && prevEstado === true) {
      req.io.emit('recorteUtilizado', recorteActualizado);
    }
    
    // Si el recorte sigue disponible pero cambió cantidad, emitir evento específico
    if (nuevoEstado === true) {
      req.io.emit('recorteDisponibleUpdated', recorteActualizado);
    }

    res.json(recorteActualizado);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar el recorte', 
      error: error.message 
    });
  }
};

// Actualizar recorte
exports.updateRecorte = async (req, res) => {
  try {
    const { id } = req.params;
    const { largo, ancho, espesor, cantidad, maquinaId, observaciones } = req.body;

    const recorte = await Recorte.findByPk(id);
    if (!recorte) {
      return res.status(404).json({ message: 'Recorte no encontrado' });
    }

    // Verificar si la máquina existe si se está actualizando
    if (maquinaId) {
      const maquina = await Maquina.findByPk(maquinaId);
      if (!maquina) {
        return res.status(404).json({ message: 'Máquina no encontrada' });
      }
    }

    // Procesar la imagen si existe una nueva
    let imagenPath = recorte.imagen;
    if (req.file) {
      if (process.env.NODE_ENV === 'production') {
        // En producción, convertir imagen a base64
        const base64Image = req.file.buffer.toString('base64');
        imagenPath = `data:${req.file.mimetype};base64,${base64Image}`;
      } else {
        // En desarrollo, eliminar imagen anterior y usar nueva ruta
        if (recorte.imagen && !recorte.imagen.startsWith('data:')) {
          const oldImagePath = path.join(__dirname, '..', recorte.imagen);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        imagenPath = '/uploads/' + req.file.filename;
      }
    }

    await recorte.update({
      largo: largo ?? recorte.largo,
      ancho: ancho ?? recorte.ancho,
      espesor: espesor ?? recorte.espesor,
      cantidad: cantidad ?? recorte.cantidad,
      maquinaId: maquinaId ?? recorte.maquinaId,
      imagen: imagenPath,
      observaciones: observaciones ?? recorte.observaciones
    });

    // Obtener el recorte actualizado con la información de la máquina
    const recorteActualizado = await Recorte.findByPk(id, {
      include: [{ model: Maquina }]
    });

    // Emitir evento de actualización
    req.io.emit('recorteUpdated', recorteActualizado);

    res.json(recorteActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el recorte', error: error.message });
  }
};

// Eliminar un recorte
exports.deleteRecorte = async (req, res) => {
  try {
    const { id } = req.params;
    const recorte = await Recorte.findByPk(id);
    
    if (!recorte) {
      return res.status(404).json({ message: 'Recorte no encontrado' });
    }

    // Eliminar la imagen si existe (solo en desarrollo)
    if (recorte.imagen && process.env.NODE_ENV !== 'production' && !recorte.imagen.startsWith('data:')) {
      const imagePath = path.join(__dirname, '..', recorte.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await recorte.destroy();

    // Emitir evento de eliminación
    req.io.emit('recorteDeleted', id);

    res.json({ message: 'Recorte eliminado exitosamente', id });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el recorte', error: error.message });
  }
};
