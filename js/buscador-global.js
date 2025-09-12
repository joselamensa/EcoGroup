// Buscador Global - Funciona desde index.html y productos.html
// Este archivo maneja la búsqueda global en toda la aplicación

// Función para inicializar el buscador global
function inicializarBuscadorGlobal() {
    console.log('Inicializando buscador global...');
    
    // Buscar todos los inputs de búsqueda
    const searchInputs = [
        document.getElementById('search-input-navbar'),
        document.getElementById('search-input-navbar-mobile'),
        document.querySelector('input[name="query"]')
    ].filter(input => input !== null);
    
    const searchButtons = [
        document.getElementById('search-button-navbar'),
        document.getElementById('search-button-navbar-mobile'),
        document.querySelector('button[type="submit"]')
    ].filter(button => button !== null);
    
    console.log('Inputs encontrados:', searchInputs.length);
    console.log('Botones encontrados:', searchButtons.length);
    
    // Función para realizar búsqueda global
    function realizarBusquedaGlobal(query) {
        console.log('Búsqueda global iniciada:', query);
        
        // Limpiar query
        query = (query || '').trim();
        
        // Determinar si estamos en index.html o productos.html
        const currentPath = window.location.pathname;
        const isInProductos = currentPath.includes('productos.html');
        
        if (isInProductos) {
            // Si estamos en productos.html
            if (query === '') {
                console.log('Búsqueda vacía en productos.html, redirigiendo sin parámetros');
                window.location.href = window.location.pathname;
            } else {
                console.log('Estamos en productos.html, actualizando URL con query');
                const currentUrl = new URL(window.location);
                currentUrl.searchParams.set('query', query);
                window.location.href = currentUrl.toString();
            }
        } else {
            // Si estamos en index.html
            if (query === '') {
                console.log('Búsqueda vacía desde index, redirigiendo a productos sin query');
                window.location.href = './htmls/productos.html';
            } else {
                console.log('Estamos en index.html, redirigiendo a productos.html con query');
                window.location.href = `./htmls/productos.html?query=${encodeURIComponent(query)}`;
            }
        }
    }
    
    // Función para realizar búsqueda en productos.html
    function realizarBusquedaEnProductos(query) {
        // Limpiar query
        query = (query || '').trim();
        
        // Esperar a que el sistema de paginación esté listo
        function esperarSistemaYBuscar() {
            if (typeof paginacionManager !== 'undefined' && typeof productos !== 'undefined' && productos && Object.keys(productos).length > 0) {
                console.log('Sistema de paginación disponible, aplicando filtro de búsqueda');
                paginacionManager.aplicarFiltrosExternos({ busqueda: query });
            } else {
                console.log('Sistema de paginación no disponible, esperando...');
                setTimeout(esperarSistemaYBuscar, 200);
            }
        }
        
        esperarSistemaYBuscar();
    }
    
    // Función de búsqueda fallback
    function buscarEnProductosFallback(query) {
        if (typeof productos === 'undefined' || !productos || Object.keys(productos).length === 0) {
            console.log('Productos no disponibles para búsqueda');
            return;
        }
        
        const resultados = [];
        const queryLower = query.toLowerCase().trim();
        
        console.log('Buscando en', Object.keys(productos).length, 'categorías');
        
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
        mostrarResultadosBusqueda(resultados, query);
    }
    
    // Función para mostrar resultados de búsqueda
    function mostrarResultadosBusqueda(resultados, query) {
        const container = document.getElementById('productos-container');
        if (!container) {
            console.log('Contenedor de productos no encontrado');
            return;
        }
        
        if (resultados.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-search fa-2x mb-3"></i>
                        <h4>No se encontraron productos</h4>
                        <p>No se encontraron productos que coincidan con "${query}"</p>
                        <button class="btn btn-primary" onclick="window.location.href='./productos.html'">Ver todos los productos</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Mostrar mensaje de resultados
        const mensajeResultados = document.createElement('div');
        mensajeResultados.className = 'col-12 mb-3';
        mensajeResultados.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                <strong>${resultados.length}</strong> producto(s) encontrado(s) para "${query}"
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="window.location.href='./productos.html'">Ver todos</button>
            </div>
        `;
        container.appendChild(mensajeResultados);
        
        // Mostrar productos encontrados
        resultados.forEach(producto => {
            const productoElement = crearElementoProductoBusqueda(producto);
            container.appendChild(productoElement);
        });
    }
    
    // Función para crear elemento de producto en búsqueda
    function crearElementoProductoBusqueda(producto) {
        const div = document.createElement('div');
        div.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        const precio = producto.precio || 0;
        const precioFormateado = precio.toLocaleString('es-AR');
        const imagen = producto.imagen || '../imgs/productos/default.jpg';
        
        // Generar ID único para este producto
        const idUnico = generarIdUnicoProducto(producto.nombre, producto.descripcion);
        
        div.innerHTML = `
            <div class="card h-100">
                <div class="position-relative">
                    <img src="${imagen}" 
                         class="card-img-top" 
                         alt="${producto.nombre}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='../imgs/productos/default.jpg'">
                    ${producto.precio ? '' : '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning">Sin precio</span></div>'}
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${producto.nombre}</h6>
                    <p class="card-text text-muted small flex-grow-1">${producto.descripcion || 'Sin descripción'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold text-primary">$${precioFormateado}</span>
                            ${producto.tipo ? `<small class="text-muted">${producto.tipo}</small>` : ''}
                        </div>
                        <div class="input-group">
                            <input type="number" class="form-control form-control-sm" 
                                   value="1" min="1" 
                                   id="cantidad-${idUnico}">
                            <button class="btn btn-primary btn-sm" 
                                    onclick="agregarAlCarritoFlotante({
                                        nombre: '${producto.nombre.replace(/'/g, "\\'")}',
                                        descripcion: '${(producto.descripcion || '').replace(/'/g, "\\'")}',
                                        precio: ${precio},
                                        imagen: '${imagen}'
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
    
    // Configurar event listeners para todos los inputs
    searchInputs.forEach(input => {
        // Evento para Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                realizarBusquedaGlobal(input.value);
            }
        });
    });
    
    // Configurar event listeners para todos los botones
    searchButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Encontrar el input asociado
            const form = button.closest('form');
            const input = form ? form.querySelector('input[type="text"], input[name="query"]') : null;
            
            if (input) {
                realizarBusquedaGlobal(input.value);
            }
        });
    });
    
    console.log('Buscador global inicializado correctamente');
}

// Función para procesar búsqueda desde URL (para productos.html)
function procesarBusquedaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || urlParams.get('q');
    
    if (query && query.trim() !== '') {
        console.log('Procesando búsqueda desde URL:', query);
        
        // Llenar los inputs de búsqueda
        const searchInputs = [
            document.getElementById('search-input-navbar'),
            document.getElementById('search-input-navbar-mobile')
        ].filter(input => input !== null);
        
        searchInputs.forEach(input => {
            input.value = query;
        });
        
        // La búsqueda ya se procesará automáticamente por paginacion.js desde los parámetros URL
        console.log('Búsqueda desde URL será procesada por el sistema de paginación');
    }
}

// Función de búsqueda fallback (disponible globalmente)
function buscarEnProductosFallback(query) {
    if (typeof productos === 'undefined' || !productos || Object.keys(productos).length === 0) {
        console.log('Productos no disponibles para búsqueda');
        return;
    }
    
    const resultados = [];
    const queryLower = query.toLowerCase().trim();
    
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
    
    mostrarResultadosBusqueda(resultados, query);
}

// Función para mostrar resultados (disponible globalmente)
function mostrarResultadosBusqueda(resultados, query) {
    const container = document.getElementById('productos-container');
    if (!container) return;
    
    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <h4>No se encontraron productos</h4>
                    <p>No se encontraron productos que coincidan con "${query}"</p>
                    <button class="btn btn-primary" onclick="window.location.href='./productos.html'">Ver todos los productos</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    const mensajeResultados = document.createElement('div');
    mensajeResultados.className = 'col-12 mb-3';
    mensajeResultados.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>${resultados.length}</strong> producto(s) encontrado(s) para "${query}"
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="window.location.href='./productos.html'">Ver todos</button>
        </div>
    `;
    container.appendChild(mensajeResultados);
    
    resultados.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        const precio = producto.precio || 0;
        const precioFormateado = precio.toLocaleString('es-AR');
        const imagen = producto.imagen || '../imgs/productos/default.jpg';
        const idUnico = generarIdUnicoProducto(producto.nombre, producto.descripcion);
        
        div.innerHTML = `
            <div class="card h-100">
                <div class="position-relative">
                    <img src="${imagen}" 
                         class="card-img-top" 
                         alt="${producto.nombre}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='../imgs/productos/default.jpg'">
                    ${producto.precio ? '' : '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning">Sin precio</span></div>'}
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${producto.nombre}</h6>
                    <p class="card-text text-muted small flex-grow-1">${producto.descripcion || 'Sin descripción'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold text-primary">$${precioFormateado}</span>
                            ${producto.tipo ? `<small class="text-muted">${producto.tipo}</small>` : ''}
                        </div>
                        <div class="input-group">
                            <input type="number" class="form-control form-control-sm" 
                                   value="1" min="1" 
                                   id="cantidad-${idUnico}">
                            <button class="btn btn-primary btn-sm" 
                                    onclick="agregarAlCarritoFlotante({
                                        nombre: '${producto.nombre.replace(/'/g, "\\'")}',
                                        descripcion: '${(producto.descripcion || '').replace(/'/g, "\\'")}',
                                        precio: ${precio},
                                        imagen: '${imagen}'
                                    }, parseInt(document.getElementById('cantidad-${idUnico}').value))">
                                <i class="fas fa-cart-plus me-1"></i>Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando buscador global...');
    inicializarBuscadorGlobal();
    
    // Si estamos en productos.html, procesar búsqueda desde URL
    if (window.location.pathname.includes('productos.html')) {
        procesarBusquedaDesdeURL();
    }
});

// Exportar funciones para uso global
window.inicializarBuscadorGlobal = inicializarBuscadorGlobal;
window.procesarBusquedaDesdeURL = procesarBusquedaDesdeURL;
window.buscarEnProductosFallback = buscarEnProductosFallback;
window.mostrarResultadosBusqueda = mostrarResultadosBusqueda;
