// Script combinado para configurar y verificar la base de datos
process.env.NODE_ENV = 'production';

const sequelize = require('../config/db');
const Cliente = require('../models/cliente');
const Maquina = require('../models/Maquina');
const Recorte = require('../models/Recorte');

async function setupAndVerify() {
  try {
    console.log('🚀 Iniciando configuración y verificación de la base de datos...');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    
    // Conectar a la base de datos
    console.log('\n🔗 Conectando a la base de datos de producción...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Mostrar configuración
    console.log('\n📋 Configuración de conexión:');
    console.log(`- Host: ${sequelize.config.host}`);
    console.log(`- Puerto: ${sequelize.config.port}`);
    console.log(`- Base de datos: ${sequelize.config.database}`);
    console.log(`- Usuario: ${sequelize.config.username}`);
    
    // Sincronizar modelos
    console.log('\n🔄 Sincronizando modelos con la base de datos...');
    console.log('⚠️  Usando force: true para recrear las tablas...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente.');
    
    // Verificar inmediatamente en la misma sesión
    console.log('\n🔍 Verificando tablas en la misma sesión...');
    
    // Método 1: showAllTables
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Tablas con showAllTables:', tables);
    
    // Método 2: Consulta SQL directa
    const [sqlTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log('📋 Tablas con SQL:', sqlTables.map(t => t.table_name));
    
    // Método 3: Probar consultas a los modelos
    console.log('\n🧪 Probando consultas a los modelos:');
    
    const maquinasCount = await Maquina.count();
    console.log(`✅ Máquinas: ${maquinasCount} registros`);
    
    const clientesCount = await Cliente.count();
    console.log(`✅ Clientes: ${clientesCount} registros`);
    
    const recortesCount = await Recorte.count();
    console.log(`✅ Recortes: ${recortesCount} registros`);
    
    // Crear datos de prueba
    console.log('\n🏭 Creando máquinas iniciales...');
    const maquinasIniciales = [
      { nombre: 'Cortadora Láser 1', tipo: 'laser', estado: 'activa' },
      { nombre: 'Cortadora Plasma 1', tipo: 'plasma', estado: 'activa' },
      { nombre: 'Guillotina 1', tipo: 'guillotina', estado: 'activa' }
    ];
    
    for (const maquinaData of maquinasIniciales) {
      await Maquina.create(maquinaData);
    }
    
    console.log('✅ Máquinas iniciales creadas.');
    
    // Verificar nuevamente después de crear datos
    console.log('\n🔍 Verificación final después de crear datos:');
    const finalMaquinasCount = await Maquina.count();
    console.log(`✅ Máquinas finales: ${finalMaquinasCount} registros`);
    
    // Listar las máquinas creadas
    const maquinas = await Maquina.findAll();
    console.log('📋 Máquinas creadas:');
    maquinas.forEach(maquina => {
      console.log(`  - ${maquina.nombre} (${maquina.tipo})`);
    });
    
    console.log('\n🎉 Configuración y verificación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    throw error;
  }
}

// Ejecutar y mantener la conexión abierta para verificación
setupAndVerify()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente.');
    console.log('\n⏳ Manteniendo conexión abierta por 5 segundos para verificación...');
    
    // Mantener la conexión abierta por un momento
    setTimeout(async () => {
      try {
        console.log('\n🔍 Verificación final antes de cerrar:');
        const finalCount = await Maquina.count();
        console.log(`✅ Máquinas encontradas: ${finalCount}`);
      } catch (error) {
        console.log(`❌ Error en verificación final: ${error.message}`);
      } finally {
        await sequelize.close();
        console.log('\n🔒 Conexión cerrada.');
        process.exit(0);
      }
    }, 5000);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    sequelize.close().then(() => process.exit(1));
  });