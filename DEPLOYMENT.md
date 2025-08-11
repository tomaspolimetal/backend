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