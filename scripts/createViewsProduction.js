const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Configuración de la base de datos de producción
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://recortes_user:password@localhost:5432/recortes_db', {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function createDatabaseViews() {
  try {
    console.log('🔗 Conectando a la base de datos de producción...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente.');

    console.log('\n📊 Creando vistas de base de datos...');

    // Vista para recortes pendientes (estado = false)
    const viewPendientesSQL = `
      CREATE OR REPLACE VIEW vw_recortes_maquina_false AS
      SELECT 
        r.id,
        r."maquinaId",
        r.estado,
        r.fecha_creacion,
        r.fecha_actualizacion,
        r.largo,
        r.ancho,
        r.espesor,
        r.cantidad,
        r.observaciones,
        r.imagen,
        m.nombre as maquina_nombre
      FROM "Recortes" r
      LEFT JOIN "Maquinas" m ON r."maquinaId" = m.id
      WHERE r.estado = false
      ORDER BY r.fecha_creacion DESC;
    `;

    await sequelize.query(viewPendientesSQL);
    console.log('✅ Vista vw_recortes_maquina_false creada exitosamente.');

    // Vista para recortes completados (estado = true)
    const viewCompletadosSQL = `
      CREATE OR REPLACE VIEW vw_recortes_maquina_true AS
      SELECT 
        r.id,
        r."maquinaId",
        r.estado,
        r.fecha_creacion,
        r.fecha_actualizacion,
        r.largo,
        r.ancho,
        r.espesor,
        r.cantidad,
        r.observaciones,
        r.imagen,
        m.nombre as maquina_nombre
      FROM "Recortes" r
      LEFT JOIN "Maquinas" m ON r."maquinaId" = m.id
      WHERE r.estado = true
      ORDER BY r.fecha_creacion DESC;
    `;

    await sequelize.query(viewCompletadosSQL);
    console.log('✅ Vista vw_recortes_maquina_true creada exitosamente.');

    console.log('\n🔧 Creando índices para optimización...');

    // Crear índices para optimizar consultas
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_recortes_maquina_estado ON "Recortes" ("maquinaId", estado);',
      'CREATE INDEX IF NOT EXISTS idx_recortes_fecha_creacion ON "Recortes" (fecha_creacion);',
      'CREATE INDEX IF NOT EXISTS idx_recortes_maquina_fecha ON "Recortes" ("maquinaId", fecha_creacion);'
    ];

    for (const indexSQL of indices) {
      await sequelize.query(indexSQL);
      console.log(`✅ Índice creado: ${indexSQL.split(' ')[5]}`);
    }

    console.log('\n🎉 Todas las vistas e índices han sido creados exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   - vw_recortes_maquina_false: Vista para recortes pendientes');
    console.log('   - vw_recortes_maquina_true: Vista para recortes completados');
    console.log('   - Índices optimizados para consultas por máquina y fecha');

    // Verificar que las vistas se crearon correctamente
    console.log('\n🔍 Verificando vistas creadas...');
    const [pendientesCount] = await sequelize.query('SELECT COUNT(*) as count FROM vw_recortes_maquina_false;');
    const [completadosCount] = await sequelize.query('SELECT COUNT(*) as count FROM vw_recortes_maquina_true;');
    
    console.log(`   - Recortes pendientes: ${pendientesCount[0].count}`);
    console.log(`   - Recortes completados: ${completadosCount[0].count}`);

  } catch (error) {
    console.error('❌ Error al crear las vistas:', error.message);
    console.error('\n🔧 Detalles del error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada.');
  }
}

// Verificar variables de entorno
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: La variable de entorno DATABASE_URL no está definida.');
  console.log('\n💡 Asegúrate de tener configurada la URL de la base de datos de producción.');
  console.log('   Ejemplo: DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

// Ejecutar el script
console.log('🚀 Iniciando creación de vistas en base de datos de producción...');
console.log(`📍 Base de datos: ${process.env.DATABASE_URL.split('@')[1] || 'URL oculta'}`);
console.log('⚠️  ADVERTENCIA: Este script modificará la base de datos de producción.\n');

createDatabaseViews();

module.exports = { createDatabaseViews };