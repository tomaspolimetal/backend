// Establecer NODE_ENV para asegurar que use producción
process.env.NODE_ENV = 'production';

const sequelize = require('../config/db');

async function showConnectionInfo() {
  try {
    console.log('🔗 Información de Conexión a la Base de Datos\n');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    
    // Mostrar configuración actual
    const config = sequelize.config;
    console.log('📋 Configuración actual:');
    console.log(`- Host: ${config.host}`);
    console.log(`- Puerto: ${config.port}`);
    console.log(`- Base de datos: ${config.database}`);
    console.log(`- Usuario: ${config.username}`);
    console.log(`- Dialecto: ${config.dialect}`);
    console.log(`- SSL: ${config.dialectOptions?.ssl ? 'Habilitado' : 'Deshabilitado'}`);
    
    // Probar conexión
    console.log('\n🔍 Probando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa!');
    
    // Mostrar información de la base de datos
    console.log('\n📊 Información de la base de datos:');
    
    try {
      // Usar showAllTables de Sequelize
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      console.log('Tablas encontradas con Sequelize:', tables);
      
      // También probar con consulta SQL directa
      const [results] = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          tableowner
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);
      
      console.log('\nTablas en el esquema public (consulta SQL):');
      if (results.length === 0) {
        console.log('  No se encontraron tablas en el esquema public');
      } else {
        results.forEach(table => {
          console.log(`  - ${table.tablename} (owner: ${table.tableowner})`);
        });
      }
      
      // Verificar todos los esquemas
      const [allSchemas] = await sequelize.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schema_name;
      `);
      
      console.log('\nEsquemas disponibles:');
      allSchemas.forEach(schema => {
        console.log(`  - ${schema.schema_name}`);
      });
      
    } catch (error) {
      console.log('❌ Error al obtener información de tablas:', error.message);
    }
    
    // Mostrar versión de PostgreSQL
    const [versionResult] = await sequelize.query('SELECT version();');
    console.log(`\n🐘 PostgreSQL: ${versionResult[0].version.split(' ')[1]}`);
    
    // Información de conexiones
    const [connectionResult] = await sequelize.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections
      FROM pg_stat_activity;
    `);
    
    console.log(`\n🔌 Conexiones:`);
    console.log(`  - Total: ${connectionResult[0].total_connections}`);
    console.log(`  - Activas: ${connectionResult[0].active_connections}`);
    
    console.log('\n🎉 Información recopilada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al obtener información:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  showConnectionInfo()
    .then(() => {
      console.log('\n✅ Proceso completado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = showConnectionInfo;