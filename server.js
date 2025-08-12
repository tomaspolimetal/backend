// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/db');
const { DataTypes } = require('sequelize');
const maquinaRoutes = require('./routes/maquinaRoutes');
const recorteRoutes = require('./routes/recorteRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Exportar io para usarlo en otros archivos
module.exports = { io, app };

// Configuración de middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public')); // Comentado porque el directorio no existe
// Servir archivos estáticos desde la carpeta uploads (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Función para emitir eventos a todos los clientes
const emitToAll = (event, data) => {
  io.emit(event, data);
};

// Rutas API con eventos socket
const maquinasRouter = maquinaRoutes;
const recortesRouter = recorteRoutes;
const clientesRouter = clienteRoutes;

// Middleware para inyectar el emisor de eventos en las solicitudes
app.use((req, res, next) => {
  req.io = { emit: emitToAll };
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/maquinas', maquinasRouter);
app.use('/api/recortes', recortesRouter);
app.use('/api/clientes', clientesRouter);

// Configuración de Socket.IO para tiempo real
io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  try {
    const Recorte = require('./models/Recorte');
    const Maquina = require('./models/Maquina');

    // Obtener todas las máquinas
    const maquinas = await Maquina.findAll({
      attributes: ['id', 'nombre']
    });
    
    // Enviar las máquinas al cliente
    socket.emit('initialMaquinas', maquinas);

    // Obtener todos los recortes disponibles (estado true)
    const recortesDisponibles = await Recorte.findAll({
      where: {
        estado: true
      },
      include: [{
        model: Maquina,
        attributes: ['id', 'nombre']
      }],
      order: [['fecha_creacion', 'DESC']]
    });
    
    // Obtener todos los recortes utilizados (estado false)
    const recortesUtilizados = await Recorte.findAll({
      where: {
        estado: false
      },
      include: [{
        model: Maquina,
        attributes: ['id', 'nombre']
      }],
      order: [['fecha_actualizacion', 'DESC']]
    });
    
    // Enviar los recortes iniciales al cliente
    socket.emit('initialRecortes', recortesDisponibles);
    socket.emit('initialRecortesUtilizados', recortesUtilizados);
  } catch (error) {
    console.error('Error al obtener datos:', error);
  }

  // Permitir que el cliente solicite recargar recortes bajo demanda
  socket.on('getRecortes', async () => {
    try {
      const Recorte = require('./models/Recorte');
      const Maquina = require('./models/Maquina');

      const recortesDisponibles = await Recorte.findAll({
        where: { estado: true },
        include: [{ model: Maquina, attributes: ['id', 'nombre'] }],
        order: [['fecha_creacion', 'DESC']]
      });

      const recortesUtilizados = await Recorte.findAll({
        where: { estado: false },
        include: [{ model: Maquina, attributes: ['id', 'nombre'] }],
        order: [['fecha_actualizacion', 'DESC']]
      });

      socket.emit('initialRecortes', recortesDisponibles);
      socket.emit('initialRecortesUtilizados', recortesUtilizados);
    } catch (err) {
      console.error('Error al recargar recortes:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Database sync and server start
const PORT = process.env.PORT || 3001;

// Asegurar esquema de BD en producción (cambiar Recortes.imagen a TEXT si es necesario)
async function ensureDatabaseSchema() {
  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('Recortes');
    const imagenCol = table && table.imagen;

    if (imagenCol) {
      const typeStr = String(imagenCol.type || '').toLowerCase();
      if (!typeStr.includes('text')) {
        console.log('Actualizando columna Recortes.imagen a tipo TEXT...');
        await qi.changeColumn('Recortes', 'imagen', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
        console.log('Columna Recortes.imagen actualizada a TEXT correctamente');
      } else {
        console.log('La columna Recortes.imagen ya es de tipo TEXT');
      }
    } else {
      console.warn('No se encontró la columna imagen en la tabla Recortes al describir la tabla');
    }
  } catch (err) {
    console.warn('No se pudo garantizar el esquema de la BD (imagen TEXT):', err.message);
  }
}

const startServer = async () => {
  try {
    // Iniciar el servidor HTTP primero
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Server is accessible from other devices in the network');
    });

    // Intentar conectar a la base de datos
    await sequelize.authenticate();
    console.log('Database connection established');

    // Garantizar el esquema (especialmente en producción donde no corren migraciones)
    await ensureDatabaseSchema();

    await sequelize.sync();
    console.log('Database connected and synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.error('Server will continue running without database connection');
    console.error('Please check your database configuration and environment variables');
  }
}

startServer();

// Manejo limpio del cierre
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database:', error);
    process.exit(1);
  }
});