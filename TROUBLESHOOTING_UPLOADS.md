# Guía de Resolución de Problemas - Subida de Archivos

## Problema Identificado
Error 500 al subir imágenes en producción (Render) con el mensaje:
> "Error al crear el recorte: Error del servidor. El backend no está configurado correctamente para manejar archivos."

## Solución Implementada

### 1. Configuración Adaptativa de Multer
- **Desarrollo**: Usa `multer.diskStorage()` para guardar archivos en `/uploads`
- **Producción**: Usa `multer.memoryStorage()` para evitar problemas con el sistema de archivos efímero de Render

### 2. Almacenamiento de Imágenes
- **Desarrollo**: Rutas de archivos (`/uploads/filename.jpg`)
- **Producción**: Imágenes convertidas a base64 y almacenadas en la base de datos

### 3. Mejoras en el Manejo de Errores
- Logs de depuración detallados
- Manejo específico de errores de Multer
- Middleware de error personalizado
- Ruta de prueba `/api/recortes/test-upload`

## Verificación Post-Despliegue

### 1. Verificar Variables de Ambiente
Asegúrate de que en Render esté configurado:
```
NODE_ENV=production
PORT=10000
```

### 2. Probar la Ruta de Diagnóstico
```bash
# Test sin archivo
curl -X POST https://tu-app.onrender.com/api/recortes/test-upload

# Test con archivo (usando un cliente como Postman)
POST https://tu-app.onrender.com/api/recortes/test-upload
Form-data: imagen = [archivo de imagen]
```

### 3. Verificar Logs en Render
1. Ve al dashboard de Render
2. Selecciona tu servicio
3. Ve a la pestaña "Logs"
4. Busca los mensajes de debug que comienzan con `=== DEBUG createRecorte ===`

## Posibles Problemas Adicionales

### Si el problema persiste:

1. **Verificar el tipo de contenido del frontend**
   - Asegúrate de que el frontend envíe `multipart/form-data`
   - Verifica que el campo se llame exactamente `imagen`

2. **Verificar la migración de base de datos**
   - El campo `imagen` debe ser de tipo `TEXT` para soportar base64
   - Ejecutar migración si es necesario

3. **Verificar límites de Render**
   - Render tiene límites de memoria y tiempo de ejecución
   - Considera reducir el límite de tamaño de archivo si es necesario

## Comandos de Diagnóstico

```bash
# Verificar configuración actual
curl https://tu-app.onrender.com/api/recortes/test-upload

# Crear recorte sin imagen (debe funcionar)
curl -X POST https://tu-app.onrender.com/api/recortes \
  -H "Content-Type: application/json" \
  -d '{"largo": 100, "ancho": 50, "espesor": 2, "cantidad": 1, "maquinaId": "ID_VALIDO"}'
```

## Contacto
Si el problema persiste después de seguir estos pasos, revisar los logs de Render y contactar al equipo de desarrollo con la información específica del error.