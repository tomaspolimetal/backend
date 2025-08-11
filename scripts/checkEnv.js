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
  production: [
    'PROD_DB_HOST',
    'PROD_DB_PORT',
    'PROD_DB_NAME', 
    'PROD_DB_USER',
    'PROD_DB_PASSWORD'
  ]
};

function checkEnvironmentVariables() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🔍 Verificando variables de entorno para: ${env}`);
  
  const requiredVars = requiredEnvVars[env] || requiredEnvVars.development;
  const missingVars = [];
  
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