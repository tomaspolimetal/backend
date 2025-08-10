// Establecer NODE_ENV para asegurar que use producción
process.env.NODE_ENV = 'production';

const sequelize = require('../config/db');
const Cliente = require('../models/cliente');
const Maquina = require('../models/Maquina');
const Recorte = require('../models/Recorte');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión y verificando tablas...');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');
    
    // Mostrar configuración
    console.log('\n📋 Configuración de conexión:');
    console.log(`- Host: ${sequelize.config.host}`);
    console.log(`- Puerto: ${sequelize.config.port}`);
    console.log(`- Base de datos: ${sequelize.config.database}`);
    console.log(`- Usuario: ${sequelize.config.username}`);
    
    // Usar el mismo método que el script de setup
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('\n📋 Tablas encontradas:', tables);
    
    // Probar consultas directas a los modelos
    console.log('\n🧪 Probando consultas a los modelos:');
    
    try {
      const maquinasCount = await Maquina.count();
      console.log(`✅ Máquinas: ${maquinasCount} registros`);
    } catch (error) {
      console.log(`❌ Error al consultar Máquinas: ${error.message}`);
    }
    
    try {
      const clientesCount = await Cliente.count();
      console.log(`✅ Clientes: ${clientesCount} registros`);
    } catch (error) {
      console.log(`❌ Error al consultar Clientes: ${error.message}`);
    }
    
    try {
      const recortesCount = await Recorte.count();
      console.log(`✅ Recortes: ${recortesCount} registros`);
    } catch (error) {
      console.log(`❌ Error al consultar Recortes: ${error.message}`);
    }
    
    // Consulta SQL directa para verificar tablas
    console.log('\n🔍 Consulta SQL directa:');
    try {
      const [result] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);
      
      console.log('Tablas en information_schema:', result.map(r => r.table_name));
    } catch (error) {
      console.log(`❌ Error en consulta SQL: ${error.message}`);
    }
    
    console.log('\n🎉 Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
testConnection()
  .then(() => {
    console.log('\n✅ Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });