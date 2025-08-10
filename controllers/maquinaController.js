const Maquina = require('../models/Maquina');

exports.getAllMaquinas = async (req, res) => {
  try {
    const maquinas = await Maquina.findAll();
    res.json(maquinas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las máquinas', error: error.message });
  }
};

// Crear una nueva máquina
exports.createMaquina = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }    const maquina = await Maquina.create({
      nombre,
      descripcion
    });

    // Emitir evento de nueva máquina
    req.io.emit('newMaquina', maquina);
    
    res.status(201).json(maquina);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la máquina', error: error.message });
  }
};
