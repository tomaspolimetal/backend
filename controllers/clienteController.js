const Cliente = require('../models/cliente');

// Get all clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single cliente
exports.getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (cliente) {
      res.json(cliente);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new cliente
exports.createCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create({
      ...req.body,
      estado: true // Aseguramos que el estado sea true por defecto
    });
    
    // Emitir evento a través de la instancia de socket
    req.io.emit('newCliente', cliente);
    // Emit socket event for new material
    req.io.emit('newMaterial', cliente);
    
    res.status(201).json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a cliente
exports.updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (cliente) {
      await cliente.update(req.body);
      
      // Emitir evento de actualización
      req.io.emit('clienteUpdated', cliente);
      
      res.json(cliente);
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (cliente) {
      await cliente.destroy();
      
      // Emitir evento de eliminación
      req.io.emit('clienteDeleted', req.params.id);
      
      res.json({ message: 'Cliente eliminado' });
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update material usage
exports.updateMaterialUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (cantidad > cliente.cantidad) {
      return res.status(400).json({ 
        message: 'La cantidad a utilizar es mayor que la disponible' 
      });
    }

    const nuevaCantidad = cliente.cantidad - cantidad;
    const nuevoEstado = nuevaCantidad > 0;

    await cliente.update({
      cantidad: nuevaCantidad,
      estado: nuevoEstado,
      updatedAt: new Date()
    });

    // Emitir evento de actualización
    req.io.emit('materialUpdated', cliente);
    
    res.json(cliente);
  } catch (error) {
    console.error('Error al actualizar uso de material:', error);
    res.status(400).json({ message: error.message });
  }
};