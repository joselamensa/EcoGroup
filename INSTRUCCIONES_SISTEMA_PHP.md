# 🚀 Sistema de Gestión de Precios con Backend PHP

## ✅ **Archivos Creados**

### **1. Archivos de Datos**
- **`productos.json`** - Base de datos de productos con precios
- **`js/productos_frontend.js`** - Frontend que carga desde el servidor

### **2. Scripts PHP Backend**
- **`guardar_precios.php`** - Guarda cambios de precios desde el admin
- **`cargar_productos.php`** - Carga productos para el frontend

### **3. Archivos Modificados**
- **`js/admin.js`** - Admin ahora usa backend PHP
- **`htmls/productos.html`** - Frontend usa nuevo sistema

---

## 🔧 **Cómo Funciona**

### **Flujo de Datos:**
1. **Admin edita precios** → Envía a `guardar_precios.php`
2. **PHP guarda en `productos.json`** → Genera `productos.js` automáticamente
3. **Frontend carga desde `cargar_productos.php`** → Muestra precios actualizados

### **Ventajas:**
- ✅ **Cambios globales**: Los precios se actualizan para todos los usuarios
- ✅ **Persistencia**: Los cambios quedan guardados en el servidor
- ✅ **Seguridad**: Solo el admin puede modificar precios
- ✅ **Compatibilidad**: Mantiene la estructura existente

---

## 📋 **Instrucciones de Uso**

### **1. Configuración Inicial**
```bash
# Asegúrate de que tu servidor tenga PHP habilitado
# Los archivos PHP deben estar en el directorio raíz del proyecto
```

### **2. Acceso al Admin**
- Ve a: `http://tu-dominio.com/admin.html`
- Usuario: `admin`
- Contraseña: `admin123`

### **3. Editar Precios**
1. **Entra al admin** y ve a "Gestionar Productos"
2. **Busca el producto** que quieres editar
3. **Modifica el precio** en el campo correspondiente
4. **Haz clic fuera del campo** - se guarda automáticamente
5. **Verifica** que el precio se actualizó en la tienda

### **4. Verificar Cambios**
- **En la tienda**: `http://tu-dominio.com/htmls/productos.html`
- **En el admin**: Los cambios aparecen inmediatamente
- **En el servidor**: Revisa `productos.json` y `js/productos.js`

---

## 🔍 **Troubleshooting**

### **Si los precios no se guardan:**
1. **Verifica permisos**: El servidor debe poder escribir en `productos.json`
2. **Revisa logs**: Abre la consola del navegador (F12)
3. **Prueba el PHP**: Ve a `http://tu-dominio.com/cargar_productos.php`

### **Si el frontend no carga:**
1. **Verifica la URL**: Asegúrate de que `cargar_productos.php` esté accesible
2. **Revisa CORS**: Los headers están configurados para permitir peticiones
3. **Fallback**: Si falla, usa los productos locales como respaldo

### **Si el admin no funciona:**
1. **Verifica credenciales**: Usuario `admin`, contraseña `admin123`
2. **Revisa la consola**: Busca errores de JavaScript
3. **Prueba la conexión**: Verifica que `guardar_precios.php` responda

---

## 🛠️ **Mantenimiento**

### **Backup Automático:**
- **`productos.json`** - Contiene todos los datos de productos
- **`js/productos.js`** - Se genera automáticamente desde el JSON
- **Recomendación**: Haz backup regular de `productos.json`

### **Agregar Nuevos Productos:**
1. **Edita `productos.json`** directamente
2. **O usa el admin** para agregar productos
3. **El sistema** sincroniza automáticamente

### **Cambiar Credenciales del Admin:**
- **Edita `js/admin.js`** línea 70-75
- **Cambia usuario y contraseña** por defecto

---

## 📞 **Soporte**

### **Logs Útiles:**
- **Consola del navegador**: F12 → Console
- **Network tab**: Para ver peticiones HTTP
- **PHP logs**: Si tienes acceso al servidor

### **Comandos de Prueba:**
```bash
# Probar carga de productos
curl http://tu-dominio.com/cargar_productos.php

# Verificar archivo JSON
cat productos.json
```

---

## 🎯 **Próximos Pasos**

1. **Prueba el sistema** con algunos precios
2. **Configura credenciales** seguras del admin
3. **Haz backup** de `productos.json`
4. **Personaliza** categorías y productos según necesites

**¡El sistema está listo para usar!** 🚀 