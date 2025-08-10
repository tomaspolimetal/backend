const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Maquina = sequelize.define('Maquina', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Maquina;
