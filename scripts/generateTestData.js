const { Sequelize } = require('sequelize');
const Recorte = require('../models/Recorte');
const Maquina = require('../models/Maquina');

async function generateTestData() {
  try {
    // Get all machines first
    const maquinas = await Maquina.findAll();
    
    if (maquinas.length === 0) {
      console.log('No hay máquinas en la base de datos. Crea algunas máquinas primero.');
      return;
    }

    // Get current date and last month's date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    console.log('Comenzando la generación de datos de prueba...');

    // For each machine, create 100 recortes
    for (const maquina of maquinas) {
      console.log(`Generando recortes para máquina: ${maquina.nombre}`);
      
      // Create 100 recortes
      for (let i = 0; i < 100; i++) {
        // Generate random data
        const recorte = {
          largo: Math.floor(Math.random() * (3000 - 100) + 100), // Random between 100 and 3000mm
          ancho: Math.floor(Math.random() * (2000 - 100) + 100), // Random between 100 and 2000mm
          espesor: Math.floor(Math.random() * (100 - 1) + 1), // Random between 1 and 100mm
          cantidad: Math.floor(Math.random() * (50 - 1) + 1), // Random between 1 and 50
          estado: Math.random() > 0.3, // 70% true, 30% false
          maquinaId: maquina.id,
          fecha_creacion: i < 50 ? // 50 recortes del mes actual, 50 del mes pasado
            new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * now.getDate() + 1)) :
            new Date(lastMonth.getFullYear(), lastMonth.getMonth(), Math.floor(Math.random() * 28 + 1)),
          fecha_actualizacion: new Date() // Current date for all
        };

        await Recorte.create(recorte);
      }
    }

    console.log('¡Generación de datos de prueba completada!');
    console.log(`Se crearon ${maquinas.length * 100} recortes en total.`);

  } catch (error) {
    console.error('Error al generar datos de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
generateTestData();