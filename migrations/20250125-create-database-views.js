'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear índices para optimizar las consultas
    await queryInterface.addIndex('Recortes', {
      fields: ['maquinaId', 'estado', 'fecha_creacion'],
      name: 'idx_recortes_maquina_estado_fecha'
    });

    await queryInterface.addIndex('Recortes', {
      fields: ['maquinaId', 'estado'],
      name: 'idx_recortes_maquina_estado'
    });

    await queryInterface.addIndex('Recortes', {
      fields: ['estado', 'fecha_creacion'],
      name: 'idx_recortes_estado_fecha'
    });

    // Vista para recortes con estado false por máquina (utilizados)
    await queryInterface.sequelize.query(`
      CREATE VIEW vw_recortes_maquina_false AS
      SELECT 
        r.id,
        r.largo,
        r.ancho,
        r.espesor,
        r.cantidad,
        r.estado,
        r.imagen,
        r.observaciones,
        r."maquinaId",
        r.fecha_creacion,
        r.fecha_actualizacion,
        m.nombre as maquina_nombre
      FROM "Recortes" r
      INNER JOIN "Maquinas" m ON r."maquinaId" = m.id
      WHERE r.estado = false
      ORDER BY r.fecha_actualizacion DESC;
    `);

    // Vista para recortes con estado true por máquina (disponibles)
    await queryInterface.sequelize.query(`
      CREATE VIEW vw_recortes_maquina_true AS
      SELECT 
        r.id,
        r.largo,
        r.ancho,
        r.espesor,
        r.cantidad,
        r.estado,
        r.imagen,
        r.observaciones,
        r."maquinaId",
        r.fecha_creacion,
        r.fecha_actualizacion,
        m.nombre as maquina_nombre
      FROM "Recortes" r
      INNER JOIN "Maquinas" m ON r."maquinaId" = m.id
      WHERE r.estado = true
      ORDER BY r.fecha_creacion DESC;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar las vistas
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS vw_recortes_maquina_false;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS vw_recortes_maquina_true;');

    // Eliminar los índices
    await queryInterface.removeIndex('Recortes', 'idx_recortes_maquina_estado_fecha');
    await queryInterface.removeIndex('Recortes', 'idx_recortes_maquina_estado');
    await queryInterface.removeIndex('Recortes', 'idx_recortes_estado_fecha');
  }
};