// estadisticasController.js
const { Op } = require('sequelize');
const Recorte = require('../models/Recorte');
const Maquina = require('../models/Maquina');
const sequelize = require('../config/db');

// Obtener estadísticas por máquina específica
const getEstadisticasPorMaquina = async (req, res) => {
  try {
    const { maquinaId } = req.params;
    const { fechaInicio, fechaFin, ultimoMes } = req.query;

    // Construir filtros de fecha
    let filtroFecha = {};
    
    if (ultimoMes === 'true') {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 1);
      filtroFecha = {
        fecha_creacion: {
          [Op.gte]: fechaLimite
        }
      };
    } else if (fechaInicio && fechaFin) {
      filtroFecha = {
        fecha_creacion: {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
        }
      };
    } else if (fechaInicio) {
      filtroFecha = {
        fecha_creacion: {
          [Op.gte]: new Date(fechaInicio)
        }
      };
    } else if (fechaFin) {
      filtroFecha = {
        fecha_creacion: {
          [Op.lte]: new Date(fechaFin)
        }
      };
    }

    // Verificar que la máquina existe
    const maquina = await Maquina.findByPk(maquinaId);
    if (!maquina) {
      return res.status(404).json({ error: 'Máquina no encontrada' });
    }

    // Obtener conteos de recortes disponibles (estado true)
    const recortesDisponibles = await Recorte.count({
      where: {
        maquinaId,
        estado: true,
        ...filtroFecha
      }
    });

    // Obtener conteos de recortes utilizados (estado false)
    const recortesUtilizados = await Recorte.count({
      where: {
        maquinaId,
        estado: false,
        ...filtroFecha
      }
    });

    // Obtener total de recortes
    const totalRecortes = await Recorte.count({
      where: {
        maquinaId,
        ...filtroFecha
      }
    });

    // Calcular porcentajes
    const porcentajeDisponibles = totalRecortes > 0 ? ((recortesDisponibles / totalRecortes) * 100).toFixed(2) : 0;
    const porcentajeUtilizados = totalRecortes > 0 ? ((recortesUtilizados / totalRecortes) * 100).toFixed(2) : 0;

    // Obtener estadísticas adicionales por fecha
    const estadisticasPorFecha = await Recorte.findAll({
      where: {
        maquinaId,
        ...filtroFecha
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('fecha_creacion')), 'fecha'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN estado = true THEN 1 ELSE 0 END')), 'disponibles'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN estado = false THEN 1 ELSE 0 END')), 'utilizados']
      ],
      group: [sequelize.fn('DATE', sequelize.col('fecha_creacion'))],
      order: [[sequelize.fn('DATE', sequelize.col('fecha_creacion')), 'DESC']],
      limit: 30 // Últimos 30 días
    });

    const response = {
      maquina: {
        id: maquina.id,
        nombre: maquina.nombre
      },
      periodo: {
        ultimoMes: ultimoMes === 'true',
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null
      },
      estadisticas: {
        recortesDisponibles,
        recortesUtilizados,
        totalRecortes,
        porcentajeDisponibles: parseFloat(porcentajeDisponibles),
        porcentajeUtilizados: parseFloat(porcentajeUtilizados)
      },
      estadisticasPorFecha,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener estadísticas por máquina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener resumen de estadísticas de todas las máquinas
const getResumenEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, ultimoMes } = req.query;

    // Construir filtros de fecha
    let filtroFecha = {};
    
    if (ultimoMes === 'true') {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 1);
      filtroFecha = {
        fecha_creacion: {
          [Op.gte]: fechaLimite
        }
      };
    } else if (fechaInicio && fechaFin) {
      filtroFecha = {
        fecha_creacion: {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
        }
      };
    } else if (fechaInicio) {
      filtroFecha = {
        fecha_creacion: {
          [Op.gte]: new Date(fechaInicio)
        }
      };
    } else if (fechaFin) {
      filtroFecha = {
        fecha_creacion: {
          [Op.lte]: new Date(fechaFin)
        }
      };
    }

    // Obtener todas las máquinas
    const maquinas = await Maquina.findAll({
      attributes: ['id', 'nombre']
    });

    // Obtener estadísticas por máquina
    const estadisticasPorMaquina = await Promise.all(
      maquinas.map(async (maquina) => {
        const recortesDisponibles = await Recorte.count({
          where: {
            maquinaId: maquina.id,
            estado: true,
            ...filtroFecha
          }
        });

        const recortesUtilizados = await Recorte.count({
          where: {
            maquinaId: maquina.id,
            estado: false,
            ...filtroFecha
          }
        });

        const totalRecortes = recortesDisponibles + recortesUtilizados;
        const porcentajeDisponibles = totalRecortes > 0 ? ((recortesDisponibles / totalRecortes) * 100).toFixed(2) : 0;
        const porcentajeUtilizados = totalRecortes > 0 ? ((recortesUtilizados / totalRecortes) * 100).toFixed(2) : 0;

        return {
          maquina: {
            id: maquina.id,
            nombre: maquina.nombre
          },
          recortesDisponibles,
          recortesUtilizados,
          totalRecortes,
          porcentajeDisponibles: parseFloat(porcentajeDisponibles),
          porcentajeUtilizados: parseFloat(porcentajeUtilizados)
        };
      })
    );

    // Calcular totales generales
    const totalesGenerales = estadisticasPorMaquina.reduce(
      (acc, curr) => {
        acc.recortesDisponibles += curr.recortesDisponibles;
        acc.recortesUtilizados += curr.recortesUtilizados;
        acc.totalRecortes += curr.totalRecortes;
        return acc;
      },
      { recortesDisponibles: 0, recortesUtilizados: 0, totalRecortes: 0 }
    );

    const porcentajeGeneralDisponibles = totalesGenerales.totalRecortes > 0 
      ? ((totalesGenerales.recortesDisponibles / totalesGenerales.totalRecortes) * 100).toFixed(2) 
      : 0;
    const porcentajeGeneralUtilizados = totalesGenerales.totalRecortes > 0 
      ? ((totalesGenerales.recortesUtilizados / totalesGenerales.totalRecortes) * 100).toFixed(2) 
      : 0;

    const response = {
      periodo: {
        ultimoMes: ultimoMes === 'true',
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null
      },
      totalesGenerales: {
        ...totalesGenerales,
        porcentajeDisponibles: parseFloat(porcentajeGeneralDisponibles),
        porcentajeUtilizados: parseFloat(porcentajeGeneralUtilizados)
      },
      estadisticasPorMaquina,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener resumen de estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas en tiempo real para dashboard
const getEstadisticasEnTiempoReal = async (req, res) => {
  try {
    // Obtener conteos totales
    const totalRecortes = await Recorte.count();
    const recortesDisponibles = await Recorte.count({ where: { estado: true } });
    const recortesUtilizados = await Recorte.count({ where: { estado: false } });
    
    // Obtener conteos por máquina
    const estadisticasPorMaquina = await sequelize.query(`
      SELECT 
        m.id,
        m.nombre,
        COUNT(r.id) as total_recortes,
        SUM(CASE WHEN r.estado = true THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN r.estado = false THEN 1 ELSE 0 END) as utilizados
      FROM "Maquinas" m
      LEFT JOIN "Recortes" r ON m.id = r."maquinaId"
      GROUP BY m.id, m.nombre
      ORDER BY m.nombre
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Obtener actividad reciente (últimos 10 recortes)
    const actividadReciente = await Recorte.findAll({
      include: [{
        model: Maquina,
        attributes: ['nombre']
      }],
      order: [['fecha_actualizacion', 'DESC']],
      limit: 10,
      attributes: ['id', 'estado', 'fecha_creacion', 'fecha_actualizacion']
    });

    const response = {
      resumen: {
        totalRecortes,
        recortesDisponibles,
        recortesUtilizados,
        porcentajeDisponibles: totalRecortes > 0 ? ((recortesDisponibles / totalRecortes) * 100).toFixed(2) : 0,
        porcentajeUtilizados: totalRecortes > 0 ? ((recortesUtilizados / totalRecortes) * 100).toFixed(2) : 0
      },
      estadisticasPorMaquina: estadisticasPorMaquina.map(stat => ({
        maquina: {
          id: stat.id,
          nombre: stat.nombre
        },
        totalRecortes: parseInt(stat.total_recortes),
        disponibles: parseInt(stat.disponibles),
        utilizados: parseInt(stat.utilizados)
      })),
      actividadReciente,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener estadísticas en tiempo real:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEstadisticasPorMaquina,
  getResumenEstadisticas,
  getEstadisticasEnTiempoReal
};