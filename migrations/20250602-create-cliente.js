'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      cliente: {
        type: Sequelize.STRING,
        allowNull: false
      },
      espesor: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      tipoMaterial: {
        type: Sequelize.STRING,
        allowNull: false
      },
      largo: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ancho: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      remito: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      observaciones: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  }
};
