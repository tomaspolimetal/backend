const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = sequelize.define('cliente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  espesor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tipoMaterial: {
    type: DataTypes.STRING,
    allowNull: false
  },
  largo: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ancho: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  remito: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
});

module.exports = Cliente;
