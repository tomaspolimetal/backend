#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showUsage() {
  colorLog('cyan', '\n🔧 Script para crear vistas de base de datos en producción');
  console.log('\n📋 Uso:');
  console.log('   node scripts/runCreateViews.js [DATABASE_URL]');
  console.log('\n📝 Ejemplos:');
  console.log('   # Usando variable de entorno');
  console.log('   DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/runCreateViews.js');
  console.log('\n   # Pasando URL como parámetro');
  console.log('   node scripts/runCreateViews.js "postgresql://user:pass@host:5432/db"');
  console.log('\n   # Usando archivo .env');
  console.log('   node scripts/runCreateViews.js --env');
  console.log('\n🔗 Formatos de URL soportados:');
  console.log('   - PostgreSQL: postgresql://user:password@host:port/database');
  console.log('   - Render PostgreSQL: postgres://user:password@host:port/database');
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/["']/g, '');
      }
    });
    
    return envVars;
  }
  return {};
}

function validateDatabaseUrl(url) {
  if (!url) {
    return false;
  }
  
  // Verificar formato básico de URL de base de datos (acepta postgresql:// y postgres://)
  const dbUrlPattern = /^(postgresql|postgres):\/\/.+@.+:\d+\/.+$/;
  return dbUrlPattern.test(url);
}

function main() {
  const args = process.argv.slice(2);
  let databaseUrl = null;
  
  colorLog('bright', '🚀 Iniciando script de creación de vistas...');
  
  // Determinar la URL de la base de datos
  if (args.length > 0) {
    if (args[0] === '--env') {
      // Cargar desde archivo .env
      const envVars = loadEnvFile();
      databaseUrl = envVars.DATABASE_URL || envVars.DATABASE_URL_PRODUCTION;
      if (databaseUrl) {
        colorLog('green', '✅ URL de base de datos cargada desde archivo .env');
      }
    } else if (args[0] === '--help' || args[0] === '-h') {
      showUsage();
      return;
    } else {
      // URL pasada como parámetro
      databaseUrl = args[0];
      colorLog('green', '✅ URL de base de datos recibida como parámetro');
    }
  } else {
    // Intentar desde variable de entorno
    databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      colorLog('green', '✅ URL de base de datos encontrada en variables de entorno');
    }
  }
  
  // Validar URL
  if (!validateDatabaseUrl(databaseUrl)) {
    colorLog('red', '❌ Error: URL de base de datos no válida o no encontrada');
    console.log('');
    if (!databaseUrl) {
      colorLog('yellow', '💡 No se encontró DATABASE_URL en:');
      console.log('   - Variables de entorno del sistema');
      console.log('   - Archivo .env');
      console.log('   - Parámetros del comando');
    } else {
      colorLog('yellow', `💡 URL proporcionada: ${databaseUrl}`);
      colorLog('yellow', '   Formato esperado: postgresql://user:password@host:port/database');
    }
    console.log('');
    showUsage();
    process.exit(1);
  }
  
  // Mostrar información de conexión (ocultando credenciales)
  const urlParts = databaseUrl.split('@');
  const hostInfo = urlParts[1] || 'host oculto';
  colorLog('cyan', `📍 Conectando a: ${hostInfo}`);
  
  // Confirmar ejecución
  colorLog('yellow', '⚠️  ADVERTENCIA: Este script modificará la base de datos de producción.');
  colorLog('magenta', '🔄 Ejecutando creación de vistas...');
  console.log('');
  
  try {
    // Ejecutar el script de creación de vistas
    const scriptPath = path.join(__dirname, 'createViewsProduction.js');
    const env = { ...process.env, DATABASE_URL: databaseUrl };
    
    execSync(`node "${scriptPath}"`, {
      stdio: 'inherit',
      env: env,
      cwd: path.join(__dirname, '..')
    });
    
    console.log('');
    colorLog('green', '🎉 ¡Script ejecutado exitosamente!');
    colorLog('cyan', '📊 Las vistas de base de datos han sido creadas.');
    colorLog('blue', '🔗 Ahora puedes probar los nuevos endpoints paginados.');
    
  } catch (error) {
    console.log('');
    colorLog('red', '❌ Error al ejecutar el script:');
    console.error(error.message);
    process.exit(1);
  }
}

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  colorLog('yellow', '⚠️  Script interrumpido por el usuario.');
  process.exit(0);
});

// Ejecutar función principal
if (require.main === module) {
  main();
}

module.exports = { main };