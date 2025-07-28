// Script para agregar precios a todos los productos existentes
function agregarPreciosAProductos() {
    // Verificar que la variable productos existe
    if (typeof productos === 'undefined') {
        console.log('Variable productos no encontrada, esperando...');
        return;
    }
    
    let productosActualizados = 0;
    
    // Recorrer todas las categorías y agregar precio a cada producto
    Object.keys(productos).forEach(categoria => {
        productos[categoria].forEach(producto => {
            if (!producto.hasOwnProperty('precio')) {
                producto.precio = 0;
                productosActualizados++;
            }
        });
    });
    
    console.log(`Precios agregados a ${productosActualizados} productos`);
    
    // Sincronizar con el admin panel
    if (typeof sincronizarProductosConAdmin === 'function') {
        sincronizarProductosConAdmin();
    }
}

// Función para verificar productos sin precio
function verificarProductosSinPrecio() {
    if (typeof productos === 'undefined') {
        console.log('Variable productos no encontrada');
        return;
    }
    
    let productosSinPrecio = 0;
    let totalProductos = 0;
    
    Object.keys(productos).forEach(categoria => {
        productos[categoria].forEach(producto => {
            totalProductos++;
            if (!producto.hasOwnProperty('precio')) {
                productosSinPrecio++;
                console.log(`Producto sin precio: ${producto.nombre} - ${producto.descripcion}`);
            }
        });
    });
    
    console.log(`Total productos: ${totalProductos}`);
    console.log(`Productos sin precio: ${productosSinPrecio}`);
    
    return productosSinPrecio;
}

// Función para agregar precios a todos los productos de una vez
function agregarPreciosATodosLosProductos() {
    if (typeof productos === 'undefined') {
        console.log('Variable productos no encontrada');
        return;
    }
    
    let productosActualizados = 0;
    
    // Recorrer todas las categorías
    Object.keys(productos).forEach(categoria => {
        productos[categoria].forEach(producto => {
            if (!producto.hasOwnProperty('precio')) {
                producto.precio = 0;
                productosActualizados++;
            }
        });
    });
    
    console.log(`✅ Se agregaron precios a ${productosActualizados} productos`);
    
    // Sincronizar con el admin panel
    if (typeof sincronizarProductosConAdmin === 'function') {
        sincronizarProductosConAdmin();
    }
    
    // Recargar la página de productos si estamos en ella
    if (window.location.pathname.includes('productos.html')) {
        setTimeout(() => {
            if (typeof cargarProductos === 'function') {
                cargarProductos();
            }
        }, 500);
    }
}

// Ejecutar cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que productos.js se haya cargado
    setTimeout(() => {
        verificarProductosSinPrecio();
        agregarPreciosATodosLosProductos();
    }, 100);
});

// También ejecutar después de un delay adicional por si acaso
setTimeout(() => {
    verificarProductosSinPrecio();
    agregarPreciosATodosLosProductos();
}, 1000);

// Función global para ejecutar manualmente desde la consola
window.agregarPreciosATodosLosProductos = agregarPreciosATodosLosProductos;
window.verificarProductosSinPrecio = verificarProductosSinPrecio; 