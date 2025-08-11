require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración basada en el entorno
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  // Configuración para Render.com
  if (process.env.DATABASE_URL) {
    // Configuración usando DATABASE_URL (Render, Heroku, etc.)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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
    // Configuración manual para producción (Render)
    sequelize = new Sequelize({
      username: process.env.PROD_DB_USER || 'recortes_db_user',
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME || 'recortes_db',
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  }
} else {
  // Configuración para desarrollo usando variables de entorno
  sequelize = new Sequelize(
    process.env.DEV_DB_NAME || 'recortes',
    process.env.DEV_DB_USER || 'postgres',
    process.env.DEV_DB_PASSWORD || 'password',
    {
      host: process.env.DEV_DB_HOST || 'localhost',
      dialect: 'postgres',
      port: process.env.DEV_DB_PORT || 5432,
      logging: false
    }
  );
}

module.exports = sequelize;
