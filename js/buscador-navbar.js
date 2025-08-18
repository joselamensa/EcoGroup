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
        if (query.trim() === '') {
            // Si está vacío, mostrar todos los productos
            if (typeof cargarProductos === 'function') {
                cargarProductos();
            }
            return;
        }
        
        // Realizar búsqueda usando la función existente
        if (typeof buscarProductos === 'function') {
            buscarProductos(query);
        } else {
            // Fallback: buscar en productos existentes
            buscarEnProductosExistentes(query);
        }
    }
    
    // Función de búsqueda fallback
    function buscarEnProductosExistentes(query) {
        if (typeof productos === 'undefined') {
            console.log('Productos no cargados aún');
            return;
        }
        
        const resultados = [];
        const queryLower = query.toLowerCase();
        
        // Buscar en todas las categorías
        Object.keys(productos).forEach(categoria => {
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
        });
        
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
                        <button class="btn btn-primary" onclick="agregarAlCarritoFlotante({
                            nombre: '${producto.nombre}',
                            descripcion: '${producto.descripcion}',
                            precio: ${precio},
                            imagen: '../${producto.imagen}'
                        })">Agregar al carrito</button>
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
            
            // Esperar a que los productos se carguen antes de ejecutar la búsqueda
            function ejecutarBusquedaInicial() {
                if (typeof productos !== 'undefined' && productos) {
                    // Intentar usar la función nativa si existe
                    if (typeof buscarProductos === 'function') {
                        buscarProductos(q);
                    } else {
                        // Fallback interno
                        const resultados = [];
                        const queryLower = q.toLowerCase();
                        Object.keys(productos).forEach(categoria => {
                            productos[categoria].forEach(producto => {
                                const nombre = (producto.nombre || '').toLowerCase();
                                const descripcion = (producto.descripcion || '').toLowerCase();
                                const marca = (producto.marca || '').toLowerCase();
                                const tipo = (producto.tipo || '').toLowerCase();
                                if (nombre.includes(queryLower) || descripcion.includes(queryLower) || marca.includes(queryLower) || tipo.includes(queryLower)) {
                                    resultados.push({...producto, categoria});
                                }
                            });
                        });
                        
                        const container = document.getElementById('productos-container');
                        if (!container) return;
                        
                        if (resultados.length === 0) {
                            container.innerHTML = `
                                <div class="col-12 text-center">
                                    <div class="alert alert-info">
                                        <h4>No se encontraron productos</h4>
                                        <p>No se encontraron productos que coincidan con "${q}"</p>
                                        <button class="btn btn-primary" onclick="cargarProductos()">Ver todos los productos</button>
                                    </div>
                                </div>
                            `;
                            return;
                        }
                        
                        container.innerHTML = '';
                        
                        // Mostrar mensaje de resultados
                        const mensajeResultados = document.createElement('div');
                        mensajeResultados.className = 'col-12 mb-3';
                        mensajeResultados.innerHTML = `
                            <div class="alert alert-success">
                                <strong>${resultados.length}</strong> producto(s) encontrado(s) para "${q}"
                                <button class="btn btn-sm btn-outline-primary ms-2" onclick="cargarProductos()">Ver todos</button>
                            </div>
                        `;
                        container.appendChild(mensajeResultados);
                        
                        // Mostrar productos encontrados
                        resultados.forEach(p => {
                            const div = document.createElement('div');
                            div.className = 'col-md-4 col-lg-3 mb-4';
                            const precio = p.precio || 0;
                            const precioFormateado = precio.toLocaleString('es-AR');
                            div.innerHTML = `
                                <div class="card h-100">
                                    <img src="../${p.imagen}" class="card-img-top" alt="${p.nombre}" style="height:200px; object-fit:cover;" onerror="this.src='../imgs/productos/default.jpg'">
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="card-title">${p.nombre}</h5>
                                        <p class="card-text flex-grow-1">${p.descripcion}</p>
                                        <div class="mt-auto">
                                            <p class="card-text"><strong>Precio: $${precioFormateado}</strong></p>
                                            <button class="btn btn-primary" onclick="agregarAlCarritoFlotante({nombre: '${p.nombre}', descripcion: '${p.descripcion}', precio: ${precio}, imagen: '../${p.imagen}'})">Agregar al carrito</button>
                                        </div>
                                    </div>
                                </div>`;
                            container.appendChild(div);
                        });
                    }
                } else {
                    // Si los productos aún no están cargados, esperar un poco más
                    setTimeout(ejecutarBusquedaInicial, 500);
                }
            }
            
            // Ejecutar la búsqueda inicial después de un pequeño delay para asegurar que los productos estén cargados
            setTimeout(ejecutarBusquedaInicial, 1000);
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
