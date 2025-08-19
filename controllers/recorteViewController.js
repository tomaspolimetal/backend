'use strict';

const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// GET /api/recortes/maquina/:maquinaId/pendientes?page=N
// Devuelve recortes con estado false por máquina, paginados de 10 en 10
exports.getPendientesByMaquina = async (req, res) => {
  try {
    const { maquinaId } = req.params;
    const page = Number.parseInt(req.query.page, 10) > 0 ? Number.parseInt(req.query.page, 10) : 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const countResult = await sequelize.query(
      'SELECT COUNT(*)::int AS count FROM vw_recortes_maquina_false WHERE "maquinaId" = :maquinaId',
      { replacements: { maquinaId }, type: QueryTypes.SELECT }
    );
    const total = countResult?.[0]?.count ?? 0;

    const data = await sequelize.query(
      'SELECT * FROM vw_recortes_maquina_false WHERE "maquinaId" = :maquinaId ORDER BY fecha_actualizacion DESC LIMIT :limit OFFSET :offset',
      { replacements: { maquinaId, limit, offset }, type: QueryTypes.SELECT }
    );

    return res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener recortes pendientes por máquina', error: error.message });
  }
};

// GET /api/recortes/maquina/:maquinaId/estado/:estado?page=N
// Devuelve recortes por máquina y estado (true/false), paginados de 10 en 10
exports.getByMaquinaEstado = async (req, res) => {
  try {
    const { maquinaId, estado } = req.params;
    const estadoStr = String(estado).toLowerCase();
    if (estadoStr !== 'true' && estadoStr !== 'false') {
      return res.status(400).json({ message: 'Parámetro estado inválido. Use "true" o "false".' });
    }

    const page = Number.parseInt(req.query.page, 10) > 0 ? Number.parseInt(req.query.page, 10) : 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const isTrue = estadoStr === 'true';
    const viewName = isTrue ? 'vw_recortes_maquina_true' : 'vw_recortes_maquina_false';
    const orderColumn = isTrue ? 'fecha_creacion' : 'fecha_actualizacion';

    const countResult = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM ${viewName} WHERE "maquinaId" = :maquinaId`,
      { replacements: { maquinaId }, type: QueryTypes.SELECT }
    );
    const total = countResult?.[0]?.count ?? 0;

    const data = await sequelize.query(
      `SELECT * FROM ${viewName} WHERE "maquinaId" = :maquinaId ORDER BY ${orderColumn} DESC LIMIT :limit OFFSET :offset`,
      { replacements: { maquinaId, limit, offset }, type: QueryTypes.SELECT }
    );

    return res.json({ page, limit, total, totalPages: Math.ceil(total / limit), data });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener recortes por máquina y estado', error: error.message });
  }
};