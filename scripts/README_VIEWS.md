# 📊 Scripts de Creación de Vistas de Base de Datos

Este directorio contiene scripts para crear las vistas de base de datos necesarias para los endpoints paginados de recortes.

## 🎯 Propósito

Los scripts crean automáticamente:
- **vw_recortes_maquina_false**: Vista optimizada para recortes pendientes (estado = false)
- **vw_recortes_maquina_true**: Vista optimizada para recortes completados (estado = true)
- **Índices de optimización**: Para mejorar el rendimiento de las consultas

## 📁 Archivos

### `createViewsProduction.js`
Script principal que se conecta a la base de datos y crea las vistas e índices.

### `runCreateViews.js`
Script auxiliar que facilita la ejecución con diferentes métodos de configuración.

## 🚀 Uso

### Método 1: Usando npm scripts (Recomendado)

```bash
# Usando variable de entorno DATABASE_URL
DATABASE_URL="postgresql://user:password@host:5432/database" npm run create-views

# Usando archivo .env
npm run create-views:env
```

### Método 2: Ejecución directa con Node.js

```bash
# Pasando URL como parámetro
node scripts/runCreateViews.js "postgresql://user:password@host:5432/database"

# Usando archivo .env
node scripts/runCreateViews.js --env

# Usando variable de entorno
DATABASE_URL="postgresql://user:password@host:5432/database" node scripts/runCreateViews.js
```

### Método 3: Script directo (Avanzado)

```bash
# Solo si ya tienes DATABASE_URL configurada
DATABASE_URL="postgresql://user:password@host:5432/database" node scripts/createViewsProduction.js
```

## 🔧 Configuración

### Opción 1: Variable de Entorno
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Opción 2: Archivo .env
Crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Opción 3: Parámetro Directo
Pasa la URL directamente al script como se muestra en los ejemplos de uso.

## 🔗 Formatos de URL Soportados

- **PostgreSQL estándar**: `postgresql://user:password@host:port/database`
- **Render PostgreSQL**: `postgres://user:password@host:port/database`
- **Con SSL**: Las conexiones SSL están habilitadas automáticamente

## 📋 Ejemplo de URL de Render

Si tu aplicación está en Render, la URL típicamente se ve así:
```
postgres://username:password@dpg-xxxxx-a.oregon-postgres.render.com/database_name
```

## ✅ Verificación

Después de ejecutar el script, verás:

```
🎉 Todas las vistas e índices han sido creados exitosamente!

📋 Resumen:
   - vw_recortes_maquina_false: Vista para recortes pendientes
   - vw_recortes_maquina_true: Vista para recortes completados
   - Índices optimizados para consultas por máquina y fecha

🔍 Verificando vistas creadas...
   - Recortes pendientes: 15
   - Recortes completados: 8
```

## 🛠️ Troubleshooting

### Error: "URL de base de datos no válida"
- Verifica que la URL tenga el formato correcto
- Asegúrate de que incluya usuario, contraseña, host, puerto y nombre de base de datos

### Error: "Connection refused"
- Verifica que la base de datos esté accesible
- Confirma que las credenciales sean correctas
- Para Render, asegúrate de usar la URL externa, no la interna

### Error: "SSL required"
- El script ya incluye configuración SSL automática
- Si persiste, verifica que tu proveedor de base de datos requiera SSL

## 🔒 Seguridad

- **Nunca** commits URLs de base de datos con credenciales al repositorio
- Usa variables de entorno o archivos `.env` (que deben estar en `.gitignore`)
- Las credenciales se ocultan automáticamente en los logs del script

## 📊 Endpoints Habilitados

Una vez creadas las vistas, estos endpoints estarán disponibles:

- `GET /api/recortes/maquina/:maquinaId/pendientes?page=1&limit=10`
- `GET /api/recortes/maquina/:maquinaId/estado/:estado?page=1&limit=10`

## 🆘 Ayuda

Para ver la ayuda del script:
```bash
node scripts/runCreateViews.js --help
```