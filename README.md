# Backend - Aplicación de Recortes

Backend para la aplicación de gestión de recortes con Node.js, Express, Socket.IO y PostgreSQL.

## 🚀 Características

- API REST para gestión de clientes, máquinas y recortes
- WebSockets en tiempo real con Socket.IO
- Base de datos PostgreSQL con Sequelize ORM
- Subida de archivos con Multer
- Configuración para desarrollo y producción

## 📋 Requisitos

- Node.js 16+
- PostgreSQL (local para desarrollo)
- npm o yarn

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Para desarrollo local:
```bash
npm run dev
```

## 🌐 Despliegue en Producción

### Configuración de Base de Datos

El backend está configurado para usar Railway PostgreSQL en producción:

```bash
# Configurar la base de datos de producción
npm run setup:prod-win
```

### Variables de Entorno en Railway

Configurar las siguientes variables en Railway:

```
NODE_ENV=production
PORT=3000
```

### Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm run setup:prod` - Configurar base de datos de producción (Linux/Mac)
- `npm run setup:prod-win` - Configurar base de datos de producción (Windows)

## 📁 Estructura del Proyecto

```
├── config/
│   ├── config.json          # Configuración de Sequelize
│   └── db.js               # Conexión a base de datos
├── controllers/            # Controladores de la API
├── models/                # Modelos de Sequelize
├── routes/                # Rutas de la API
├── migrations/            # Migraciones de base de datos
├── scripts/               # Scripts de utilidad
├── uploads/               # Archivos subidos
├── utils/                 # Utilidades
└── server.js             # Punto de entrada
```

## 🔗 API Endpoints

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Máquinas
- `GET /api/maquinas` - Obtener todas las máquinas
- `POST /api/maquinas` - Crear nueva máquina
- `PUT /api/maquinas/:id` - Actualizar máquina
- `DELETE /api/maquinas/:id` - Eliminar máquina

### Recortes
- `GET /api/recortes` - Obtener todos los recortes
- `POST /api/recortes` - Crear nuevo recorte (con imagen)
- `PUT /api/recortes/:id` - Actualizar recorte
- `DELETE /api/recortes/:id` - Eliminar recorte

## 🔄 WebSockets

El servidor emite eventos en tiempo real para:
- Nuevos clientes creados
- Nuevos recortes creados
- Actualizaciones de estado

## 🗄️ Base de Datos

### Modelos

1. **Cliente**
   - id (UUID)
   - cliente (String)
   - espesor (Float)
   - tipoMaterial (String)
   - largo (Float)
   - ancho (Float)
   - cantidad (Integer)
   - remito (Integer)
   - observaciones (String)
   - estado (Boolean)

2. **Máquina**
   - id (UUID)
   - nombre (String)

3. **Recorte**
   - id (UUID)
   - largo (Float)
   - ancho (Float)
   - espesor (Float)
   - cantidad (Integer)
   - estado (Boolean)
   - imagen (String)
   - observaciones (String)
   - maquinaId (UUID - Foreign Key)

## 🚀 Despliegue en Railway

1. Conectar el repositorio a Railway
2. Configurar las variables de entorno
3. Railway detectará automáticamente el `package.json` y ejecutará `npm start`
4. La base de datos se configurará automáticamente en el primer despliegue

## 📝 Notas

- Las imágenes se almacenan en la carpeta `uploads/`
- El servidor está configurado para CORS abierto (ajustar en producción si es necesario)
- Los WebSockets están configurados para funcionar con polling y websockets
- La base de datos se sincroniza automáticamente al iniciar el servidor