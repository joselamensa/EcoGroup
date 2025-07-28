# Panel de Administrador - Eco Group

## Descripción
Este panel de administrador permite gestionar productos, precios, categorías y configuraciones del sitio web de Eco Group.

## Características Implementadas

### ✅ Sistema de Precios
- Campo de precio agregado a todos los productos
- Visualización de precios en las tarjetas de productos
- Gestión de precios desde el panel de administrador

### ✅ Panel de Administrador
- **Dashboard**: Estadísticas generales del sistema
- **Gestión de Productos**: Agregar, editar, eliminar productos y precios
- **Gestión de Categorías**: Crear y administrar categorías
- **Gestión de Banners**: Administrar banners del sitio web
- **Configuración**: Ajustes del sistema y respaldo de datos

### ✅ Sistema de Autenticación
- Login seguro con credenciales
- Sesión persistente (1 hora)
- Cerrar sesión

## Acceso al Panel

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### URL de Acceso
- **Panel Principal**: `admin.html`
- **Enlace en Navbar**: Botón "Admin" en la navegación

## Funcionalidades del Panel

### Dashboard
- Total de productos
- Total de categorías
- Productos sin precio
- Última actualización

### Gestión de Productos
- **Ver todos los productos** en tabla organizada
- **Filtros**: Por categoría, búsqueda, estado de precio
- **Editar precios** directamente en la tabla
- **Agregar nuevos productos** con modal
- **Editar productos** existentes
- **Eliminar productos** con confirmación

### Gestión de Categorías
- **Ver categorías** en grid de tarjetas
- **Agregar nuevas categorías** con iconos FontAwesome
- **Eliminar categorías** con confirmación

### Gestión de Banners
- **Ver banners** en grid de tarjetas con preview
- **Agregar nuevos banners** con imagen, título y configuración
- **Editar banners** existentes (título, descripción, tipo, orden)
- **Activar/desactivar banners** individualmente
- **Eliminar banners** con confirmación
- **Configurar tipo** (Desktop, Mobile, Ambos)
- **Ordenar banners** por prioridad de visualización

### Configuración
- **Moneda**: ARS (Peso Argentino) o USD (Dólar)
- **IVA**: Porcentaje configurable (por defecto 21%)
- **Exportar datos**: Descargar backup completo
- **Importar datos**: Restaurar desde backup

## Estructura de Datos

### Productos
```javascript
{
    "nombre": "Nombre del Producto",
    "imagen": "ruta/a/imagen.jpg",
    "descripcion": "Descripción del producto",
    "precio": 0, // Precio en pesos argentinos
    "tipo": "Tipo de producto",
    "marca": "Marca del producto",
    "categoria": "categoria_clave"
}
```

### Categorías
```javascript
{
    "nombre": "Nombre de la Categoría",
    "descripcion": "Descripción de la categoría",
    "icono": "fas fa-box" // Clase de FontAwesome
}
```

### Banners
```javascript
{
    "id": 1,
    "titulo": "Título del Banner",
    "descripcion": "Descripción del banner",
    "imagen": "./imgs/banners/banner.jpg",
    "tipo": "desktop", // desktop, mobile, ambos
    "orden": 1,
    "activo": true,
    "url": "https://..." // opcional
}
```

## Almacenamiento de Datos

### LocalStorage
- `productosConPrecios`: Productos con precios
- `categorias`: Categorías del sistema
- `banners`: Banners del sitio web
- `configuracion`: Configuración general
- `adminSesion`: Sesión del administrador
- `ultimaActualizacion`: Timestamp de última modificación

## Instrucciones de Uso

### 1. Acceder al Panel
1. Navegar a `admin.html`
2. Ingresar credenciales: `admin` / `admin123`
3. Hacer clic en "Iniciar Sesión"

### 2. Gestionar Productos
1. Ir a "Gestionar Productos"
2. Usar filtros para encontrar productos específicos
3. Editar precios directamente en la tabla
4. Usar botones de acción para editar/eliminar

### 3. Agregar Nuevo Producto
1. Hacer clic en "Agregar Producto"
2. Completar formulario con datos del producto
3. Asignar categoría y precio
4. Guardar producto

### 4. Gestionar Categorías
1. Ir a "Categorías"
2. Ver categorías existentes
3. Agregar nuevas categorías con iconos
4. Eliminar categorías no utilizadas

### 5. Gestionar Banners
1. Ir a "Banners"
2. Ver banners existentes con preview
3. Agregar nuevos banners con imagen y configuración
4. Editar banners existentes
5. Activar/desactivar banners según necesidad
6. Eliminar banners no utilizados

### 6. Configuración
1. Ir a "Configuración"
2. Ajustar moneda e IVA
3. Exportar datos para respaldo
4. Importar datos desde backup

## Seguridad

### Credenciales
- **Cambiar credenciales por defecto** en `js/admin.js`
- Modificar `ADMIN_CREDENTIALS` al inicio del archivo

### Sesión
- Sesión automática de 1 hora
- Cerrar sesión manualmente
- Limpiar localStorage para logout completo

## Respaldo y Restauración

### Exportar Datos
1. Ir a "Configuración"
2. Hacer clic en "Exportar Datos"
3. Descargar archivo JSON con todos los datos

### Importar Datos
1. Ir a "Configuración"
2. Hacer clic en "Importar Datos"
3. Seleccionar archivo JSON de backup
4. Confirmar importación

## Personalización

### Cambiar Credenciales
```javascript
// En js/admin.js
const ADMIN_CREDENTIALS = {
    username: 'tu_usuario',
    password: 'tu_contraseña'
};
```

### Agregar Nuevas Categorías
1. Usar el panel de administrador
2. O modificar directamente en localStorage
3. Usar iconos de FontAwesome

### Modificar Estilos
- Editar CSS en `admin.html`
- Personalizar colores y diseño
- Agregar nuevas funcionalidades visuales

## Solución de Problemas

### Productos sin Precio
- El dashboard muestra productos sin precio
- Usar filtros para encontrar productos sin precio
- Editar precios directamente en la tabla

### Sincronización de Datos
- Los productos se sincronizan automáticamente
- Verificar localStorage para datos actualizados
- Usar exportar/importar para respaldar cambios

### Problemas de Sesión
- Limpiar localStorage si hay problemas
- Verificar credenciales
- Recargar página si es necesario

## Próximas Funcionalidades

### En Desarrollo
- [ ] Gestión de usuarios múltiples
- [ ] Historial de cambios
- [ ] Notificaciones de stock
- [ ] Reportes de ventas
- [ ] Integración con base de datos

### Mejoras Futuras
- [ ] Subida de imágenes
- [ ] Gestión de inventario
- [ ] Sistema de pedidos
- [ ] Dashboard avanzado
- [ ] API REST

## Soporte

Para soporte técnico o consultas:
- Email: ecogroupservice@gmail.com
- WhatsApp: +54 11 3626-7653

---

**Eco Group Service** - Panel de Administrador v1.0 