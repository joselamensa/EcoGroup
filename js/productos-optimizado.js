// Sistema optimizado de carga de productos con paginación
// Este archivo reemplaza la funcionalidad básica de productos-cargador.js

// Variables globales
let productosCargados = false;
let productosData = {};

// Función para cargar productos de forma optimizada
async function cargarProductosOptimizado() {
    if (productosCargados) {
        return productosData;
    }

    try {
        // Mostrar loading
        mostrarLoadingProductos();
        
        // Cargar productos desde el servidor
        const response = await fetch('../cargar_productos.php');
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        if (data.success && data.productos) {
            productosData = data.productos;
            productosCargados = true;
            
            // Hacer los productos disponibles globalmente
            window.productos = productosData;
            
            // Inicializar el sistema de paginación
            if (typeof paginacionManager !== 'undefined') {
                paginacionManager.aplicarFiltros();
                paginacionManager.renderizarProductos();
            }
            
            return productosData;
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarErrorProductos(error.message);
        return {};
    }
}

// Función para mostrar loading
function mostrarLoadingProductos() {
    const container = document.getElementById('productos-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando productos...</span>
                </div>
                <h5 class="text-muted">Cargando productos...</h5>
                <p class="text-muted">Esto puede tomar unos segundos</p>
            </div>
        `;
    }
}

// Función para mostrar error
function mostrarErrorProductos(mensaje) {
    const container = document.getElementById('productos-container');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h5>Error al cargar productos</h5>
                    <p class="mb-3">${mensaje}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh me-2"></i>Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

// Función para precargar imágenes importantes
function precargarImagenesImportantes() {
    const imagenesImportantes = [
        '../imgs/productos/default.jpg',
        '../imgs/logos/logoempresanav.png'
    ];
    
    imagenesImportantes.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Función para optimizar imágenes con lazy loading
function optimizarImagenes() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        // Observar todas las imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Función para mostrar información de rendimiento
function mostrarInfoRendimiento() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        console.log(`Tiempo de carga total: ${loadTime}ms`);
        
        // Mostrar mensaje si la carga fue lenta
        if (loadTime > 3000) {
            console.warn('La página tardó más de 3 segundos en cargar. Considera optimizar las imágenes.');
        }
    }
}

// Función para manejar errores de imágenes
function manejarErroresImagenes() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.src = '../imgs/productos/default.jpg';
            e.target.alt = 'Imagen no disponible';
        }
    }, true);
}

// Función para comprimir datos en localStorage
function comprimirDatosLocalStorage() {
    try {
        const carrito = localStorage.getItem('carrito');
        if (carrito && carrito.length > 10000) { // Si el carrito es muy grande
            const carritoComprimido = JSON.stringify(JSON.parse(carrito));
            localStorage.setItem('carrito', carritoComprimido);
        }
    } catch (error) {
        console.warn('No se pudo comprimir el carrito:', error);
    }
}

// Función para limpiar localStorage antiguo
function limpiarLocalStorageAntiguo() {
    try {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
        
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Error al limpiar localStorage:', error);
    }
}

// Función para inicializar optimizaciones
function inicializarOptimizaciones() {
    // Precargar imágenes importantes
    precargarImagenesImportantes();
    
    // Manejar errores de imágenes
    manejarErroresImagenes();
    
    // Limpiar localStorage antiguo
    limpiarLocalStorageAntiguo();
    
    // Comprimir datos en localStorage
    comprimirDatosLocalStorage();
    
    // Mostrar información de rendimiento
    setTimeout(mostrarInfoRendimiento, 1000);
}

// Función para recargar productos
function recargarProductos() {
    productosCargados = false;
    productosData = {};
    cargarProductosOptimizado();
}

// Función para obtener estadísticas de productos
function obtenerEstadisticasProductos() {
    if (!productosCargados) {
        return null;
    }
    
    let totalProductos = 0;
    let productosConPrecio = 0;
    let productosSinPrecio = 0;
    let categorias = 0;
    
    Object.keys(productosData).forEach(categoria => {
        categorias++;
        productosData[categoria].forEach(producto => {
            totalProductos++;
            if (producto.precio && producto.precio > 0) {
                productosConPrecio++;
            } else {
                productosSinPrecio++;
            }
        });
    });
    
    return {
        totalProductos,
        productosConPrecio,
        productosSinPrecio,
        categorias
    };
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar optimizaciones
    inicializarOptimizaciones();
    
    // Cargar productos
    cargarProductosOptimizado();
    
    // Optimizar imágenes después de un breve delay
    setTimeout(optimizarImagenes, 500);
});

// Exportar funciones para uso global
window.cargarProductosOptimizado = cargarProductosOptimizado;
window.recargarProductos = recargarProductos;
window.obtenerEstadisticasProductos = obtenerEstadisticasProductos;
