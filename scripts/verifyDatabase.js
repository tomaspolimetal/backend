const sequelize = require('../config/db');
const Cliente = require('../models/cliente');
const Maquina = require('../models/Maquina');
const Recorte = require('../models/Recorte');

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');
    
    // Obtener información de las tablas
    console.log('\n📋 Verificando tablas existentes...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Tablas encontradas:', tables);
    
    // Verificar estructura de cada tabla
    for (const table of tables) {
      if (table !== 'SequelizeMeta') {
        console.log(`\n🔍 Estructura de la tabla '${table}':`);
        try {
          const columns = await queryInterface.describeTable(table);
          console.log(JSON.stringify(columns, null, 2));
        } catch (error) {
          console.log(`❌ Error al obtener estructura de ${table}:`, error.message);
        }
      }
    }
    
    // Verificar conteo de registros
    console.log('\n📊 Conteo de registros:');
    
    try {
      const clientesCount = await Cliente.count();
      console.log(`- Clientes: ${clientesCount}`);
    } catch (error) {
      console.log('❌ Error al contar clientes:', error.message);
    }
    
    try {
      const maquinasCount = await Maquina.count();
      console.log(`- Máquinas: ${maquinasCount}`);
    } catch (error) {
      console.log('❌ Error al contar máquinas:', error.message);
    }
    
    try {
      const recortesCount = await Recorte.count();
      console.log(`- Recortes: ${recortesCount}`);
    } catch (error) {
      console.log('❌ Error al contar recortes:', error.message);
    }
    
    // Probar inserción de datos de prueba
    console.log('\n🧪 Probando inserción de datos...');
    
    try {
      // Verificar si ya existen máquinas
      const existingMaquinas = await Maquina.findAll();
      if (existingMaquinas.length === 0) {
        const maquina = await Maquina.create({
          nombre: 'Máquina de Prueba'
        });
        console.log('✅ Máquina de prueba creada:', maquina.id);
      } else {
        console.log('✅ Máquinas ya existen en la base de datos');
      }
    } catch (error) {
      console.log('❌ Error al crear máquina de prueba:', error.message);
    }
    
    try {
      // Crear cliente de prueba
      const cliente = await Cliente.create({
        cliente: 'Cliente de Prueba',
        espesor: 2.5,
        tipoMaterial: 'Acero',
        largo: 100.0,
        ancho: 50.0,
        cantidad: 1,
        remito: 12345,
        observaciones: 'Prueba de conexión',
        estado: true
      });
      console.log('✅ Cliente de prueba creado:', cliente.id);
      
      // Eliminar el cliente de prueba
      await cliente.destroy();
      console.log('✅ Cliente de prueba eliminado');
    } catch (error) {
      console.log('❌ Error al crear/eliminar cliente de prueba:', error.message);
    }
    
    console.log('\n🎉 Verificación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyDatabase()
    .then(() => {
      console.log('\n✅ Proceso de verificación completado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el proceso de verificación:', error);
      process.exit(1);
    });
}

module.exports = verifyDatabase;