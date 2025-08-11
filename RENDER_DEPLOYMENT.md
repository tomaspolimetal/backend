# Despliegue en Render

## Configuración completada

✅ **Base de datos configurada**
- Host: dpg-d2d7p949c44c73etne90-a.oregon-postgres.render.com
- Puerto: 5432
- Base de datos: recortes_db
- Usuario: recortes_db_user
- Contraseña: configurada

✅ **Tablas creadas**
- Maquinas
- clientes
- Recortes
- SequelizeMeta

✅ **Máquinas inicializadas**
- Laser 1, Laser 2, Laser 3, Laser 4
- Plasma, Plasma xpr
- Oxicorte

## Pasos para desplegar en Render

### 1. Conectar repositorio
1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona la carpeta `backend` como directorio raíz

### 2. Configuración del servicio
- **Name**: recortes-backend
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (o el que prefieras)

### 3. Variables de entorno
Configura estas variables en Render:
```
NODE_ENV=production
PROD_DB_HOST=dpg-d2d7p949c44c73etne90-a.oregon-postgres.render.com
PROD_DB_PORT=5432
PROD_DB_NAME=recortes_db
PROD_DB_USER=recortes_db_user
PROD_DB_PASSWORD=lkbVsLjhzdGBVfiblUFvNijPIocGS86p
PORT=10000
```

### 4. Desplegar
1. Haz clic en "Create Web Service"
2. Render automáticamente construirá y desplegará tu aplicación
3. Una vez completado, obtendrás una URL como: `https://recortes-backend.onrender.com`

## Verificación post-despliegue

Una vez desplegado, puedes verificar que todo funciona:

1. **Health Check**: `GET https://tu-app.onrender.com/`
2. **API Endpoints**: 
   - `GET /api/maquinas` - Listar máquinas
   - `GET /api/clientes` - Listar clientes
   - `GET /api/recortes` - Listar recortes

## Notas importantes

- La aplicación está configurada para usar PostgreSQL en producción
- Las tablas y máquinas ya están creadas en la base de datos
- El servidor Socket.IO está configurado para manejar conexiones en tiempo real
- La aplicación incluye un health check endpoint en la raíz (`/`)