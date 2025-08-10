const { Sequelize } = require('sequelize');

// Configuración basada en el entorno
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  // Configuración para producción (Railway)
  sequelize = new Sequelize({
    username: 'postgres',
    password: 'SYklYopDkLQSdgMswTasyydamYVpTAkU',
    database: 'railway',
    host: 'gondola.proxy.rlwy.net',
    port: 29955,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Configuración para desarrollo
  sequelize = new Sequelize('recortes', 'postgres', 'panchodelgado123', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
  });
}

module.exports = sequelize;
