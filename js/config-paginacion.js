// Configuración de Paginación
// Este archivo permite personalizar el comportamiento de la paginación

const CONFIG_PAGINACION = {
    // Productos por página por defecto
    productosPorPagina: 12,
    
    // Opciones de productos por página
    opcionesProductosPorPagina: [12, 24, 48],
    
    // Número de páginas a mostrar en la paginación
    paginasVisibles: 5,
    
    // Habilitar lazy loading de imágenes
    lazyLoading: true,
    
    // Tiempo de delay para mostrar loading (ms)
    delayLoading: 300,
    
    // Habilitar scroll suave al cambiar página
    scrollSuave: true,
    
    // Posición del scroll al cambiar página
    posicionScroll: 'top', // 'top', 'productos', 'paginacion'
    
    // Habilitar precarga de imágenes
    precargarImagenes: true,
    
    // Imágenes importantes para precargar
    imagenesImportantes: [
        '../imgs/productos/default.jpg',
        '../imgs/logos/logoempresanav.png'
    ],
    
    // Configuración de rendimiento
    rendimiento: {
        // Limpiar localStorage después de X días
        limpiarLocalStorageDias: 7,
        
        // Comprimir carrito si es mayor a X caracteres
        comprimirCarritoMinimo: 10000,
        
        // Mostrar advertencia si la carga tarda más de X ms
        advertenciaTiempoCarga: 3000
    },
    
    // Configuración de la sidebar móvil
    sidebarMobile: {
        // Ancho de la sidebar en móviles (%)
        ancho: 85,
        
        // Ancho máximo en píxeles
        anchoMaximo: 350,
        
        // Habilitar overlay
        overlay: true,
        
        // Cerrar automáticamente al navegar
        cerrarAlNavegar: true
    },
    
    // Configuración de búsqueda
    busqueda: {
        // Delay antes de ejecutar búsqueda (ms)
        delayBusqueda: 500,
        
        // Búsqueda en tiempo real
        tiempoReal: false,
        
        // Campos donde buscar
        campos: ['nombre', 'descripcion', 'marca', 'tipo'],
        
        // Búsqueda case sensitive
        caseSensitive: false
    },
    
    // Configuración de filtros
    filtros: {
        // Mantener filtros en URL
        mantenerEnURL: true,
        
        // Aplicar filtros automáticamente al cargar
        aplicarAlCargar: true
    }
};

// Función para obtener configuración
function obtenerConfiguracion(clave) {
    return CONFIG_PAGINACION[clave] || null;
}

// Función para actualizar configuración
function actualizarConfiguracion(clave, valor) {
    if (CONFIG_PAGINACION.hasOwnProperty(clave)) {
        CONFIG_PAGINACION[clave] = valor;
        return true;
    }
    return false;
}

// Función para obtener configuración completa
function obtenerConfiguracionCompleta() {
    return { ...CONFIG_PAGINACION };
}

// Exportar para uso global
window.CONFIG_PAGINACION = CONFIG_PAGINACION;
window.obtenerConfiguracion = obtenerConfiguracion;
window.actualizarConfiguracion = actualizarConfiguracion;
window.obtenerConfiguracionCompleta = obtenerConfiguracionCompleta;
