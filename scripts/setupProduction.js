const sequelize = require('../config/db');
const Cliente = require('../models/cliente');
const Maquina = require('../models/Maquina');
const Recorte = require('../models/Recorte');

async function setupProductionDatabase() {
  try {
    console.log('Conectando a la base de datos de producción...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (crear tablas)
    console.log('Sincronizando modelos con la base de datos...');
    console.log('⚠️  Usando force: true para recrear las tablas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente.');
    
    // Verificar que las tablas existen inmediatamente
    console.log('\n🔍 Verificando tablas creadas...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Tablas encontradas con showAllTables:', tables);
    
    // Verificar con consulta SQL directa
    const [sqlTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log('📋 Tablas encontradas con SQL:', sqlTables.map(t => t.table_name));
    
    // Probar consultas a los modelos
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
    
    // Crear datos iniciales si es necesario
    const maquinasCount = await Maquina.count();
    if (maquinasCount === 0) {
      console.log('Creando máquinas iniciales...');
      await Maquina.bulkCreate([
        { nombre: 'Máquina 1' },
        { nombre: 'Máquina 2' },
        { nombre: 'Máquina 3' }
      ]);
      console.log('✅ Máquinas iniciales creadas.');
    }
    
    console.log('🎉 Base de datos de producción configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('Proceso completado exitosamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = setupProductionDatabase;