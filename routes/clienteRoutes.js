const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Get all clientes
router.get('/', clienteController.getClientes);

// Get a single cliente
router.get('/:id', clienteController.getCliente);

// Create a new cliente
router.post('/', clienteController.createCliente);

// Update a cliente
router.put('/:id', clienteController.updateCliente);

// Update material usage
router.put('/:id/use', clienteController.updateMaterialUsage);

// Delete a cliente
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;