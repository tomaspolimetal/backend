# 🚀 Guía de Despliegue

## 📋 Preparación para GitHub

### ✅ Checklist de Seguridad

Antes de subir el proyecto a GitHub, verifica que:

- [ ] El archivo `.env` está en `.gitignore` ✅
- [ ] No hay credenciales hardcodeadas en el código ✅
- [ ] El archivo `.env.example` no contiene credenciales reales ✅
- [ ] Las variables de entorno están correctamente configuradas ✅

### 🔐 Variables de Entorno

Este proyecto utiliza variables de entorno para manejar configuraciones sensibles:

#### Desarrollo Local
```env
NODE_ENV=development
PORT=3000
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=recortes
DEV_DB_USER=postgres
DEV_DB_PASSWORD=tu_password_local
```

#### Producción
```env
NODE_ENV=production
PORT=3000
PROD_DB_HOST=tu_host_produccion
PROD_DB_PORT=5432
PROD_DB_NAME=tu_base_datos_produccion
PROD_DB_USER=postgres
PROD_DB_PASSWORD=tu_password_produccion
```

## 🌐 Plataformas de Despliegue

### Fly.io (Recomendado)

1. **Instalar Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Configurar proyecto:**
   ```bash
   # Autenticarse
   fly auth login
   
   # Inicializar proyecto
   fly launch
   ```

3. **Configurar PostgreSQL:**
   ```bash
   # Crear base de datos PostgreSQL
   fly postgres create --name tu-app-db
   
   # Conectar la app con la base de datos
   fly postgres attach --app tu-app tu-app-db
   ```

4. **Configurar variables de entorno:**
    ```bash
    # Fly automáticamente configura DATABASE_URL cuando conectas la base de datos
    # Solo necesitas configurar variables adicionales si las tienes
    fly secrets set NODE_ENV=production
    
    # Si tienes otras variables específicas de tu app
    # fly secrets set MI_VARIABLE=valor
    ```
 
 5. **Configurar migraciones (opcional):**
    ```bash
    # Si tienes migraciones de Sequelize
    # El archivo fly.toml ya está configurado para ejecutarlas automáticamente
    # durante el despliegue con: release_command = "npm run migrate"
    ```
 
 6. **Desplegar:**
    ```bash
    fly deploy
    ```
 
 7. **Verificar despliegue:**
    ```bash
    # Ver logs en tiempo real
    fly logs
    
    # Abrir la aplicación en el navegador
    fly open
    
    # Ver estado de la aplicación
    fly status
    ```
 
 **Características de Fly.io:**
 - ✅ **DATABASE_URL automática**: Se configura automáticamente al conectar PostgreSQL
 - ✅ **SSL/HTTPS**: Habilitado por defecto
 - ✅ **Auto-scaling**: Escala automáticamente según el tráfico
 - ✅ **Regiones globales**: Despliega cerca de tus usuarios
 - ✅ **WebSockets**: Soporte completo para Socket.IO
 - ✅ **Archivos estáticos**: Configurado para servir uploads

### Railway

1. **Conectar repositorio:**
   - Ve a [Railway](https://railway.app)
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto

2. **Configurar variables de entorno:**
   ```
   NODE_ENV=production
   PROD_DB_HOST=tu_host_railway
   PROD_DB_PORT=5432
   PROD_DB_NAME=railway
   PROD_DB_USER=postgres
   PROD_DB_PASSWORD=tu_password_railway
   ```

3. **Configurar base de datos:**
   - Agrega un servicio PostgreSQL
   - Railway generará automáticamente las credenciales
   - Actualiza las variables de entorno con los valores generados

### Render

1. **Crear Web Service:**
   - Ve a [Render](https://render.com)
   - Conecta tu repositorio
   - Selecciona "Web Service"

2. **Configuración:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18+

3. **Variables de entorno:**
   - Agrega todas las variables `PROD_*` en la sección Environment

### Vercel

1. **Desplegar:**
   - Ve a [Vercel](https://vercel.com)
   - Importa tu repositorio
   - Configura como Node.js project

2. **Variables de entorno:**
   - Ve a Settings > Environment Variables
   - Agrega todas las variables necesarias

## 🔧 Scripts Útiles

```bash
# Verificar variables de entorno
npm run check-env

# Desarrollo local
npm run dev

# Producción
npm start

# Configurar base de datos de producción
npm run setup:prod-win
```

## 🐛 Solución de Problemas

### Error: Variables de entorno faltantes
```
❌ Variables de entorno faltantes:
   - PROD_DB_HOST
   - PROD_DB_PASSWORD
```

**Solución:** Verifica que todas las variables estén configuradas en tu plataforma de despliegue.

### Error de conexión a base de datos

**Solución:** 
1. Verifica que las credenciales sean correctas
2. Asegúrate de que la base de datos esté accesible
3. Revisa que el puerto y host sean correctos

### Error de CORS

**Solución:** Actualiza la configuración de CORS en `server.js` para incluir tu dominio de frontend.

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Mejores prácticas de Node.js](https://nodejs.org/en/docs/guides/)

## 🔒 Seguridad

- **NUNCA** subas archivos `.env` a GitHub
- Usa variables de entorno para todas las configuraciones sensibles
- Mantén actualizadas las dependencias
- Usa HTTPS en producción
- Configura CORS apropiadamente para tu dominio