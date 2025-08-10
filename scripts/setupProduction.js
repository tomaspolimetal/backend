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
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tablas sincronizadas correctamente.');
    
    // Verificar que las tablas existen
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas creadas:', tables);
    
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