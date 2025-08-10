const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Maquina = require('./Maquina');

const Recorte = sequelize.define('Recorte', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  largo: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ancho: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  espesor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Define la relación con Maquina
Recorte.belongsTo(Maquina, {
  foreignKey: 'maquinaId',
  onDelete: 'CASCADE'
});

module.exports = Recorte;
