// Sistema de Paginación y Optimización de Carga
class PaginacionManager {
    constructor() {
        this.productosPorPagina = 12; // Productos por página
        this.paginaActual = 1;
        this.totalProductos = 0;
        this.productosFiltrados = [];
        this.filtrosActivos = {
            categoria: null,
            tipo: null,
            marca: null,
            busqueda: ''
        };
        this.productosCargados = new Set(); // Para lazy loading
    }

    // Inicializar el sistema de paginación
    inicializar() {
        this.configurarEventos();
        this.cargarProductosIniciales();
    }

    // Configurar eventos de paginación
    configurarEventos() {
        // Evento para cambio de página
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn')) {
                e.preventDefault();
                const pagina = parseInt(e.target.dataset.pagina);
                this.cambiarPagina(pagina);
            }
        });

        // Evento para cambio de productos por página
        const selectProductosPorPagina = document.getElementById('productosPorPagina');
        if (selectProductosPorPagina) {
            selectProductosPorPagina.addEventListener('change', (e) => {
                this.productosPorPagina = parseInt(e.target.value);
                this.paginaActual = 1;
                this.renderizarProductos();
            });
        }
    }

    // Cargar productos iniciales (solo los primeros)
    cargarProductosIniciales() {
        if (typeof productos === 'undefined' || !productos || Object.keys(productos).length === 0) {
            setTimeout(() => this.cargarProductosIniciales(), 100);
            return;
        }

        this.aplicarFiltros();
        this.renderizarProductos();
        this.renderizarPaginacion();
    }

    // Aplicar filtros actuales
    aplicarFiltros() {
        const urlParams = new URLSearchParams(window.location.search);
        this.filtrosActivos.categoria = urlParams.get('categoria');
        this.filtrosActivos.tipo = urlParams.get('tipo');
        this.filtrosActivos.marca = urlParams.get('marca');
        this.filtrosActivos.busqueda = urlParams.get('busqueda') || urlParams.get('query') || urlParams.get('q') || '';

        this.productosFiltrados = this.filtrarProductos();
        this.totalProductos = this.productosFiltrados.length;
    }

    // Filtrar productos según criterios activos
    filtrarProductos() {
        let productosFiltrados = [];

        // Obtener todos los productos
        Object.keys(productos).forEach(categoria => {
            if (this.filtrosActivos.categoria && categoria !== this.filtrosActivos.categoria) {
                return;
            }

            productos[categoria].forEach(producto => {
                // Filtro por tipo
                if (this.filtrosActivos.tipo && producto.tipo !== this.filtrosActivos.tipo) {
                    return;
                }

                // Filtro por marca
                if (this.filtrosActivos.marca && producto.marca !== this.filtrosActivos.marca) {
                    return;
                }

                // Filtro por búsqueda
                if (this.filtrosActivos.busqueda) {
                    const busqueda = this.filtrosActivos.busqueda.toLowerCase().trim();
                    const nombre = (producto.nombre || '').toLowerCase();
                    const descripcion = (producto.descripcion || '').toLowerCase();
                    const marca = (producto.marca || '').toLowerCase();
                    const tipo = (producto.tipo || '').toLowerCase();
                    
                    if (!nombre.includes(busqueda) && 
                        !descripcion.includes(busqueda) && 
                        !marca.includes(busqueda) && 
                        !tipo.includes(busqueda)) {
                        return;
                    }
                }

                productosFiltrados.push({
                    ...producto,
                    categoria: categoria
                });
            });
        });

        return productosFiltrados;
    }

    // Renderizar productos de la página actual
    renderizarProductos() {
        const container = document.getElementById('productos-container');
        if (!container) return;

        const inicio = (this.paginaActual - 1) * this.productosPorPagina;
        const fin = inicio + this.productosPorPagina;
        const productosPagina = this.productosFiltrados.slice(inicio, fin);

        // Mostrar loading
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando productos...</span>
                </div>
                <p class="mt-2">Cargando productos...</p>
            </div>
        `;

        // Simular carga para mejor UX
        setTimeout(() => {
            this.renderizarProductosHTML(productosPagina, container);
        }, 300);
    }

    // Renderizar HTML de productos
    renderizarProductosHTML(productosPagina, container) {
        if (productosPagina.length === 0) {
            let mensaje = 'No se encontraron productos';
            let descripcion = '';
            
            if (this.filtrosActivos.busqueda) {
                mensaje = `No se encontraron productos para "${this.filtrosActivos.busqueda}"`;
                descripcion = 'Intenta con otros términos de búsqueda o revisa la ortografía.';
            } else if (this.filtrosActivos.categoria || this.filtrosActivos.marca || this.filtrosActivos.tipo) {
                mensaje = 'No se encontraron productos con los filtros aplicados';
                descripcion = 'Prueba ajustando o eliminando algunos filtros.';
            }
            
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="fas fa-search fa-2x mb-3"></i>
                        <h4>${mensaje}</h4>
                        ${descripcion ? `<p class="mb-3">${descripcion}</p>` : ''}
                        <button class="btn btn-primary" onclick="window.location.href=window.location.pathname">
                            <i class="fas fa-times me-2"></i>Ver todos los productos
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        productosPagina.forEach(producto => {
            html += this.generarHTMLProducto(producto);
        });

        container.innerHTML = html;
        this.renderizarPaginacion();
        this.actualizarInfoPaginacion();
    }

    // Generar HTML de un producto individual
    generarHTMLProducto(producto) {
        const precio = producto.precio ? this.formatearPrecio(producto.precio) : 'Consultar';
        const imagen = producto.imagen || '../imgs/productos/default.jpg';
        
        // Crear un ID único basado en nombre + descripción
        const idUnico = this.generarIdUnico(producto.nombre, producto.descripcion);
        
        return `
            <div class="col-lg-3 col-md-4 col-6 mb-4">
                <div class="card h-100 product-card" data-producto-id="${idUnico}">
                    <div class="position-relative">
                        <img src="${imagen}" 
                             class="card-img-top" 
                             alt="${producto.nombre}"
                             loading="lazy"
                             onerror="this.src='../imgs/productos/default.jpg'">
                        ${producto.precio ? '' : '<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning">Sin precio</span></div>'}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${producto.nombre}</h6>
                        <p class="card-text text-muted small flex-grow-1">${producto.descripcion || 'Sin descripción'}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-primary">$${precio}</span>
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
                                            precio: ${producto.precio || 0},
                                            imagen: '${imagen}'
                                        }, parseInt(document.getElementById('cantidad-${idUnico}').value))">
                                    <i class="fas fa-cart-plus me-1"></i>Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar controles de paginación
    renderizarPaginacion() {
        const totalPaginas = Math.ceil(this.totalProductos / this.productosPorPagina);
        
        if (totalPaginas <= 1) {
            document.getElementById('paginacion-container')?.remove();
            return;
        }

        const container = document.getElementById('paginacion-container') || this.crearContainerPaginacion();
        
        let html = '<nav aria-label="Paginación de productos"><ul class="pagination justify-content-center">';
        
        // Botón anterior
        html += `
            <li class="page-item ${this.paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link pagination-btn" href="#" data-pagina="${this.paginaActual - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Páginas
        const inicio = Math.max(1, this.paginaActual - 2);
        const fin = Math.min(totalPaginas, this.paginaActual + 2);

        if (inicio > 1) {
            html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-pagina="1">1</a></li>`;
            if (inicio > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = inicio; i <= fin; i++) {
            html += `
                <li class="page-item ${i === this.paginaActual ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-pagina="${i}">${i}</a>
                </li>
            `;
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-pagina="${totalPaginas}">${totalPaginas}</a></li>`;
        }

        // Botón siguiente
        html += `
            <li class="page-item ${this.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link pagination-btn" href="#" data-pagina="${this.paginaActual + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        html += '</ul></nav>';
        container.innerHTML = html;
    }

    // Crear container de paginación si no existe
    crearContainerPaginacion() {
        const container = document.createElement('div');
        container.id = 'paginacion-container';
        container.className = 'mt-4';
        
        const productosContainer = document.getElementById('productos-container');
        if (productosContainer && productosContainer.parentNode) {
            productosContainer.parentNode.insertBefore(container, productosContainer.nextSibling);
        }
        
        return container;
    }

    // Actualizar información de paginación
    actualizarInfoPaginacion() {
        const inicio = (this.paginaActual - 1) * this.productosPorPagina + 1;
        const fin = Math.min(this.paginaActual * this.productosPorPagina, this.totalProductos);
        
        // Mensaje sobre filtros aplicados
        let filtrosMensaje = '';
        if (this.filtrosActivos.busqueda) {
            filtrosMensaje = ` (filtrados por: "${this.filtrosActivos.busqueda}")`;
        } else if (this.filtrosActivos.categoria || this.filtrosActivos.marca || this.filtrosActivos.tipo) {
            const filtros = [];
            if (this.filtrosActivos.categoria) filtros.push(`categoría: ${this.filtrosActivos.categoria}`);
            if (this.filtrosActivos.marca) filtros.push(`marca: ${this.filtrosActivos.marca}`);
            if (this.filtrosActivos.tipo) filtros.push(`tipo: ${this.filtrosActivos.tipo}`);
            filtrosMensaje = ` (filtrados por: ${filtros.join(', ')})`;
        }
        
        let infoHTML = `
            <div class="row align-items-center mb-3">
                <div class="col-md-6">
                    <p class="mb-0 text-muted">
                        Mostrando ${inicio}-${fin} de ${this.totalProductos} productos${filtrosMensaje}
                    </p>
                </div>
                <div class="col-md-6 text-md-end">
                    <div class="d-flex align-items-center justify-content-md-end gap-2">
                        ${this.filtrosActivos.busqueda || this.filtrosActivos.categoria || this.filtrosActivos.marca || this.filtrosActivos.tipo ? 
                            '<button class="btn btn-outline-secondary btn-sm me-2" onclick="window.location.href=window.location.pathname">Limpiar filtros</button>' : 
                            ''}
                    </div>
                </div>
            </div>
        `;

        const infoContainer = document.getElementById('paginacion-info') || this.crearInfoContainer();
        infoContainer.innerHTML = infoHTML;
    }

    // Crear container de información si no existe
    crearInfoContainer() {
        const container = document.createElement('div');
        container.id = 'paginacion-info';
        
        const productosContainer = document.getElementById('productos-container');
        if (productosContainer && productosContainer.parentNode) {
            productosContainer.parentNode.insertBefore(container, productosContainer);
        }
        
        return container;
    }

    // Cambiar página
    cambiarPagina(nuevaPagina) {
        const totalPaginas = Math.ceil(this.totalProductos / this.productosPorPagina);
        
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
            return;
        }

        this.paginaActual = nuevaPagina;
        this.renderizarProductos();
        
        // Scroll suave hacia arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Formatear precio
    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(precio);
    }

    // Aplicar filtros externos
    aplicarFiltrosExternos(filtros) {
        this.filtrosActivos = { ...this.filtrosActivos, ...filtros };
        this.paginaActual = 1;
        this.aplicarFiltros();
        this.renderizarProductos();
    }

    // Obtener filtros actuales
    obtenerFiltrosActivos() {
        return { ...this.filtrosActivos };
    }

    // Generar ID único basado en nombre y descripción
    generarIdUnico(nombre, descripcion) {
        // Combinar nombre y descripción, limpiar caracteres especiales
        const combinacion = `${nombre}-${descripcion || 'sin-descripcion'}`;
        return combinacion
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remover caracteres especiales excepto espacios y guiones
            .replace(/\s+/g, '-') // Reemplazar espacios con guiones
            .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
            .toLowerCase()
            .substring(0, 50); // Limitar longitud para evitar IDs muy largos
    }
}

// Función global para generar ID único (disponible para otros archivos)
function generarIdUnicoProducto(nombre, descripcion) {
    const combinacion = `${nombre}-${descripcion || 'sin-descripcion'}`;
    return combinacion
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .substring(0, 50);
}

// Instancia global
let paginacionManager;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    paginacionManager = new PaginacionManager();
    paginacionManager.inicializar();
});
