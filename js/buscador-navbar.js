// Buscador de Navbar - Funcionalidad para productos.html
// Este archivo maneja la funcionalidad del buscador en la navbar

// Función para inicializar el buscador de la navbar
function inicializarBuscadorNavbar() {
    // Buscador desktop
    const searchInputNavbar = document.getElementById('search-input-navbar');
    const searchButtonNavbar = document.getElementById('search-button-navbar');
    
    // Buscador móvil
    const searchInputNavbarMobile = document.getElementById('search-input-navbar-mobile');
    const searchButtonNavbarMobile = document.getElementById('search-button-navbar-mobile');
    
    // Función para realizar búsqueda
    function realizarBusqueda(query) {
        console.log('Realizando búsqueda:', query);
        
        // Limpiar query
        query = query.trim();
        
        // Si no hay query, redirigir a productos.html sin parámetros
        if (query === '') {
            console.log('Query vacío, redirigiendo a productos.html sin filtros');
            window.location.href = window.location.pathname;
            return;
        }
        
        // Actualizar URL con el query de búsqueda y recargar
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('query', query);
        window.location.href = currentUrl.toString();
    }
    
    // Función de búsqueda fallback
    function buscarEnProductosExistentes(query) {
        if (typeof productos === 'undefined' || !productos || Object.keys(productos).length === 0) {
            console.log('Productos no cargados aún');
            return;
        }
        
        const resultados = [];
        const queryLower = query.toLowerCase().trim();
        
        console.log('Buscando en productos:', Object.keys(productos).length, 'categorías');
        
        // Buscar en todas las categorías
        Object.keys(productos).forEach(categoria => {
            if (productos[categoria] && Array.isArray(productos[categoria])) {
                productos[categoria].forEach(producto => {
                    const nombre = (producto.nombre || '').toLowerCase();
                    const descripcion = (producto.descripcion || '').toLowerCase();
                    const marca = (producto.marca || '').toLowerCase();
                    const tipo = (producto.tipo || '').toLowerCase();
                    
                    if (nombre.includes(queryLower) || 
                        descripcion.includes(queryLower) || 
                        marca.includes(queryLower) || 
                        tipo.includes(queryLower)) {
                        resultados.push({
                            ...producto,
                            categoria: categoria
                        });
                    }
                });
            }
        });
        
        console.log('Resultados encontrados:', resultados.length);
        
        // Mostrar resultados
        mostrarResultadosBusqueda(resultados, query);
    }
    
    // Función para mostrar resultados de búsqueda
    function mostrarResultadosBusqueda(resultados, query) {
        const container = document.getElementById('productos-container');
        if (!container) return;
        
        if (resultados.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <h4>No se encontraron productos</h4>
                        <p>No se encontraron productos que coincidan con "${query}"</p>
                        <button class="btn btn-primary" onclick="cargarProductos()">Ver todos los productos</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Mostrar resultados
        resultados.forEach(producto => {
            const productoElement = crearElementoProducto(producto);
            container.appendChild(productoElement);
        });
        
        // Mostrar mensaje de resultados
        const mensajeResultados = document.createElement('div');
        mensajeResultados.className = 'col-12 mb-3';
        mensajeResultados.innerHTML = `
            <div class="alert alert-success">
                <strong>${resultados.length}</strong> producto(s) encontrado(s) para "${query}"
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="cargarProductos()">Ver todos</button>
            </div>
        `;
        container.insertBefore(mensajeResultados, container.firstChild);
    }
    
    // Función para crear elemento de producto
    function crearElementoProducto(producto) {
        const div = document.createElement('div');
        div.className = 'col-md-4 col-lg-3 mb-4';
        
        const precio = producto.precio || 0;
        const precioFormateado = precio.toLocaleString('es-AR');
        
        // Generar ID único para este producto
        const idUnico = generarIdUnicoProducto(producto.nombre, producto.descripcion);
        
        div.innerHTML = `
            <div class="card h-100">
                <img src="../${producto.imagen}" class="card-img-top" alt="${producto.nombre}" 
                     style="height: 200px; object-fit: cover;" 
                     onerror="this.src='../imgs/productos/default.jpg'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text flex-grow-1">${producto.descripcion}</p>
                    <div class="mt-auto">
                        <p class="card-text"><strong>Precio: $${precioFormateado}</strong></p>
                        <div class="input-group">
                            <input type="number" class="form-control form-control-sm" 
                                   value="1" min="1" 
                                   id="cantidad-${idUnico}">
                            <button class="btn btn-primary btn-sm" 
                                    onclick="agregarAlCarritoFlotante({
                                        nombre: '${producto.nombre.replace(/'/g, "\\'")}',
                                        descripcion: '${producto.descripcion.replace(/'/g, "\\'")}',
                                        precio: ${precio},
                                        imagen: '../${producto.imagen}'
                                    }, parseInt(document.getElementById('cantidad-${idUnico}').value))">
                                <i class="fas fa-cart-plus me-1"></i>Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // Event listeners para buscador desktop
    if (searchInputNavbar && searchButtonNavbar) {
        searchButtonNavbar.addEventListener('click', () => {
            realizarBusqueda(searchInputNavbar.value);
        });
        
        searchInputNavbar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                realizarBusqueda(searchInputNavbar.value);
            }
        });
    }
    
    // Event listeners para buscador móvil
    if (searchInputNavbarMobile && searchButtonNavbarMobile) {
        searchButtonNavbarMobile.addEventListener('click', () => {
            realizarBusqueda(searchInputNavbarMobile.value);
        });
        
        searchInputNavbarMobile.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                realizarBusqueda(searchInputNavbarMobile.value);
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarBuscadorNavbar();
    
    // Leer parámetro ?query= de la URL para ejecutar búsqueda inicial
    try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('query') || params.get('q');
        if (q && q.trim() !== '') {
            const inputDesktop = document.getElementById('search-input-navbar');
            const inputMobile = document.getElementById('search-input-navbar-mobile');
            if (inputDesktop) inputDesktop.value = q;
            if (inputMobile) inputMobile.value = q;
            
            // Usar el sistema de paginación directamente - este parámetro ya está siendo procesado por paginacion.js
            console.log('Parámetro de búsqueda detectado en URL:', q);
        }
    } catch(e) { 
        console.log('Error al procesar parámetro query:', e);
    }
});

// Función global para limpiar búsqueda
function limpiarBusquedaNavbar() {
    const searchInputNavbar = document.getElementById('search-input-navbar');
    const searchInputNavbarMobile = document.getElementById('search-input-navbar-mobile');
    
    if (searchInputNavbar) searchInputNavbar.value = '';
    if (searchInputNavbarMobile) searchInputNavbarMobile.value = '';
    
    if (typeof cargarProductos === 'function') {
        cargarProductos();
    }
}
