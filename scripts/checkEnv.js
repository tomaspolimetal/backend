// scripts/checkEnv.js
// Script para verificar que todas las variables de entorno necesarias estén configuradas

require('dotenv').config();

const requiredEnvVars = {
  development: [
    'DEV_DB_HOST',
    'DEV_DB_PORT', 
    'DEV_DB_NAME',
    'DEV_DB_USER',
    'DEV_DB_PASSWORD'
  ],
  production: {
    // Fly.io y plataformas similares usan DATABASE_URL
    flyio: ['DATABASE_URL'],
    // Otras plataformas usan variables individuales
    manual: [
      'PROD_DB_HOST',
      'PROD_DB_PORT',
      'PROD_DB_NAME', 
      'PROD_DB_USER',
      'PROD_DB_PASSWORD'
    ]
  }
};

function checkEnvironmentVariables() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🔍 Verificando variables de entorno para: ${env}`);
  
  let requiredVars = [];
  const missingVars = [];
  
  if (env === 'production') {
    // Verificar si existe DATABASE_URL (Fly.io, Heroku, etc.)
    if (process.env.DATABASE_URL) {
      requiredVars = requiredEnvVars.production.flyio;
      console.log('📡 Detectado DATABASE_URL - Configuración automática de plataforma');
    } else {
      requiredVars = requiredEnvVars.production.manual;
      console.log('⚙️  Usando configuración manual de base de datos');
    }
  } else {
    requiredVars = requiredEnvVars.development;
  }
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Asegúrate de tener un archivo .env configurado correctamente.');
    console.error('   Puedes usar .env.example como plantilla.');
    process.exit(1);
  }
  
  console.log('✅ Todas las variables de entorno están configuradas correctamente.');
  
  // Mostrar configuración (sin mostrar passwords)
  console.log('\n📋 Configuración actual:');
  console.log(`   NODE_ENV: ${env}`);
  console.log(`   PORT: ${process.env.PORT || '3000'}`);
  
  if (env === 'development') {
    console.log(`   DB_HOST: ${process.env.DEV_DB_HOST}`);
    console.log(`   DB_PORT: ${process.env.DEV_DB_PORT}`);
    console.log(`   DB_NAME: ${process.env.DEV_DB_NAME}`);
    console.log(`   DB_USER: ${process.env.DEV_DB_USER}`);
  } else {
    console.log(`   DB_HOST: ${process.env.PROD_DB_HOST}`);
    console.log(`   DB_PORT: ${process.env.PROD_DB_PORT}`);
    console.log(`   DB_NAME: ${process.env.PROD_DB_NAME}`);
    console.log(`   DB_USER: ${process.env.PROD_DB_USER}`);
  }
}

if (require.main === module) {
  checkEnvironmentVariables();
}

module.exports = checkEnvironmentVariables;