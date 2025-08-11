// Script para crear las máquinas específicas solicitadas
process.env.NODE_ENV = 'production';

const sequelize = require('../config/db');
const Maquina = require('../models/Maquina');

async function createMachines() {
  try {
    console.log('🏭 Creando máquinas específicas en la base de datos...');
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Definir las máquinas a crear
    const maquinasACrear = [
      { nombre: 'Laser 1', tipo: 'laser', estado: 'activa' },
      { nombre: 'Laser 2', tipo: 'laser', estado: 'activa' },
      { nombre: 'Laser 3', tipo: 'laser', estado: 'activa' },
      { nombre: 'Laser 4', tipo: 'laser', estado: 'activa' },
      { nombre: 'Plasma', tipo: 'plasma', estado: 'activa' },
      { nombre: 'Plasma xpr', tipo: 'plasma', estado: 'activa' },
      { nombre: 'Oxicorte', tipo: 'oxicorte', estado: 'activa' }
    ];
    
    console.log('\n🔍 Verificando máquinas existentes...');
    
    // Crear cada máquina, verificando si ya existe
    for (const maquinaData of maquinasACrear) {
      try {
        // Verificar si la máquina ya existe
        const maquinaExistente = await Maquina.findOne({
          where: { nombre: maquinaData.nombre }
        });
        
        if (maquinaExistente) {
          console.log(`⚠️  La máquina "${maquinaData.nombre}" ya existe (ID: ${maquinaExistente.id})`);
        } else {
          // Crear la máquina
          const nuevaMaquina = await Maquina.create(maquinaData);
          console.log(`✅ Máquina "${maquinaData.nombre}" creada exitosamente (ID: ${nuevaMaquina.id})`);
        }
      } catch (error) {
        console.log(`❌ Error al crear la máquina "${maquinaData.nombre}": ${error.message}`);
      }
    }
    
    // Mostrar resumen final
    console.log('\n📋 Resumen de máquinas en la base de datos:');
    const todasLasMaquinas = await Maquina.findAll({
      order: [['nombre', 'ASC']]
    });
    
    todasLasMaquinas.forEach((maquina, index) => {
      console.log(`  ${index + 1}. ${maquina.nombre} (${maquina.tipo}) - ${maquina.estado}`);
    });
    
    console.log(`\n🎉 Total de máquinas en la base de datos: ${todasLasMaquinas.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la creación de máquinas:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
createMachines()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });