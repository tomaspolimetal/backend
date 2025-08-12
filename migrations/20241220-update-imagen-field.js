'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Recortes', 'imagen', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Recortes', 'imagen', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};