// Configuración inicial del sistema
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Variables globales
let productosActuales = {};
let categoriasActuales = {};
let bannersActuales = [];
let productoEditando = null;
let bannerEditando = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    cargarProductosExistentes();
    cargarCategoriasDesdeServidor();
    cargarBannersExistentes();
    verificarSesion();
});

function obtenerCategoriasPorDefecto() {
    return {
        bolsas: { nombre: 'Bolsas', descripcion: 'Bolsas de residuos y basura', icono: 'fas fa-trash', tipos: [] },
        guantes: { nombre: 'Guantes', descripcion: 'Guantes de protección', icono: 'fas fa-hand-paper', tipos: [] },
        Desinfectantes: { nombre: 'Desinfectantes', descripcion: 'Productos desinfectantes', icono: 'fas fa-spray-can', tipos: [] },
        Resmas: { nombre: 'Resmas', descripcion: 'Papel para impresión', icono: 'fas fa-file-alt', tipos: [] },
        Papel: { nombre: 'Papel', descripcion: 'Productos de papel', icono: 'fas fa-toilet-paper', tipos: [] },
        Quimicos: { nombre: 'Químicos', descripcion: 'Productos químicos de limpieza', icono: 'fas fa-flask', tipos: [] },
        Dispensadores: { nombre: 'Dispensadores', descripcion: 'Dispensadores y contenedores', icono: 'fas fa-pump-soap', tipos: [] },
        Segvial: { nombre: 'Seguridad Vial', descripcion: 'Productos de seguridad vial', icono: 'fas fa-road', tipos: [] },
        Electrodomesticos: { nombre: 'Electrodomésticos', descripcion: 'Electrodomésticos', icono: 'fas fa-plug', tipos: [] },
        Indumentaria: { nombre: 'Indumentaria', descripcion: 'Ropa y calzado de trabajo', icono: 'fas fa-tshirt', tipos: [] },
        Barridoylimpieza: { nombre: 'Barrido y Limpieza', descripcion: 'Productos para limpieza', icono: 'fas fa-broom', tipos: [] },
        Herramientas: { nombre: 'Herramientas', descripcion: 'Herramientas y equipos', icono: 'fas fa-tools', tipos: [] }
    };
}

// Función para inicializar el sistema
function inicializarSistema() {
    // Configurar eventos del formulario de login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        iniciarSesion();
    });

    // Configurar eventos de navegación
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Configurar preview de imagen de producto
    document.getElementById('productoImagen').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('previewImagen');
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    });

    // Configurar preview de imagen de banner
    // document.getElementById('bannerImagen').addEventListener('change', function(e) {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             const preview = document.getElementById('previewBannerImagen');
    //             preview.src = e.target.result;
    //             preview.classList.remove('d-none');
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // });
}

// Función para verificar si hay una sesión activa
function verificarSesion() {
    const sesionActiva = localStorage.getItem('adminSesion');
    if (sesionActiva) {
        const sesion = JSON.parse(sesionActiva);
        if (sesion.timestamp && (Date.now() - sesion.timestamp) < 3600000) { // 1 hora
            mostrarDashboard(sesion.username);
        } else {
            localStorage.removeItem('adminSesion');
        }
    }
}

// Función para iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const sesion = {
            username: username,
            timestamp: Date.now()
        };
        localStorage.setItem('adminSesion', JSON.stringify(sesion));
        mostrarDashboard(username);
    } else {
        alert('Credenciales incorrectas. Usuario: admin, Contraseña: admin123');
    }
}

// Función para mostrar el dashboard
function mostrarDashboard(username) {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('adminDashboard').classList.remove('d-none');
    document.getElementById('adminUsername').textContent = username;
    
    actualizarDashboard();
    cargarTablaProductos();
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('adminSesion');
    document.getElementById('adminDashboard').classList.add('d-none');
    document.getElementById('loginSection').classList.remove('d-none');
    document.getElementById('loginForm').reset();
}

// Función para mostrar diferentes secciones
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion-admin').forEach(s => s.classList.add('d-none'));
    
    // Mostrar la sección seleccionada
    document.getElementById(seccion + 'Section').classList.remove('d-none');
    
    // Actualizar navegación activa
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    // Cargar datos específicos de la sección
    switch(seccion) {
        case 'dashboard':
            actualizarDashboard();
            break;
        case 'productos':
            cargarTablaProductos();
            break;
        case 'categorias':
            cargarCategoriasGrid();
            break;
        case 'banners':
            cargarBannersGrid();
            break;
    }
}

// Función para cargar productos existentes desde el servidor
function cargarProductosExistentes() {
    // Los productos ya están cargados por productos-cargador.js
    // Solo necesitamos sincronizar con productosActuales
    if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
        productosActuales = productos;
        console.log('Productos cargados desde JSON al admin:', productosActuales);
        actualizarDashboard();
        cargarTablaProductos();
    } else {
        console.log('Esperando que se carguen los productos desde JSON...');
        // Esperar un poco más si no están cargados, pero NO guardar datos vacíos
        setTimeout(() => {
            if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
                productosActuales = productos;
                console.log('Productos cargados desde JSON al admin (retry):', productosActuales);
                actualizarDashboard();
                cargarTablaProductos();
            } else {
                console.log('Los productos no se han cargado aún. Verificar productos.json');
            }
        }, 2000);
    }
}

// Función para cargar categorías existentes
function cargarCategoriasDesdeServidor() {
    console.log('Cargando categorías desde servidor...');
    
    fetch('cargar_categorias.php')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos del servidor:', data);
            
            if (data.success && data.categorias) {
                categoriasActuales = data.categorias;
                console.log('Categorías cargadas exitosamente:', Object.keys(categoriasActuales));
                
                // Asegurar que cada categoría tenga el array 'tipos'
                Object.keys(categoriasActuales).forEach(k => {
                    if (!Array.isArray(categoriasActuales[k].tipos)) {
                        categoriasActuales[k].tipos = [];
                    }
                });
                
                // Cargar la UI de categorías si estamos en esa sección
                const categoriasSection = document.getElementById('categoriasSection');
                if (categoriasSection && !categoriasSection.classList.contains('d-none')) {
                    cargarCategoriasGrid();
                }
                
                // Actualizar dashboard
                actualizarDashboard();
                
                console.log('Categorías procesadas correctamente');
            } else {
                console.warn('Respuesta del servidor sin datos válidos:', data);
                throw new Error('Datos de categorías inválidos');
            }
        })
        .catch(error => {
            console.error('Error al cargar categorías desde servidor:', error);
            
            // Usar categorías por defecto como fallback
            categoriasActuales = obtenerCategoriasPorDefecto();
            console.log('Usando categorías por defecto:', Object.keys(categoriasActuales));
            
            // Intentar guardar las categorías por defecto en el servidor
            guardarCategoriasEnServidor();
            
            // Cargar la UI
            cargarCategoriasGrid();
            actualizarDashboard();
            
            // Mostrar mensaje de advertencia (opcional)
            if (document.getElementById('adminDashboard') && !document.getElementById('adminDashboard').classList.contains('d-none')) {
                mostrarMensajeAdvertencia('Categorías cargadas desde configuración local');
            }
        });
}
// Función para cargar banners existentes desde el servidor
function cargarBannersExistentes() {
    fetch('cargar_banners.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                bannersActuales = data.banners;
                console.log('Banners cargados desde servidor:', bannersActuales);
                actualizarDashboard();
                // Solo actualizar el grid si estamos en la sección de banners
                const bannersSection = document.getElementById('bannersSection');
                if (bannersSection && !bannersSection.classList.contains('d-none')) {
                    cargarBannersGrid();
                }
            } else {
                console.error('Error al cargar banners:', data.error);
                // En caso de error, usar banners por defecto
                bannersActuales = [
                    {
                        id: 1,
                        titulo: 'Banner Principal',
                        descripcion: 'Banner principal de Eco Group',
                        imagen: './imgs/banners/banner1png.webp',
                        tipo: 'desktop',
                        orden: 1,
                        activo: true,
                        url: ''
                    },
                    {
                        id: 2,
                        titulo: 'Clientes que Confían',
                        descripcion: 'Banner de confianza de clientes',
                        imagen: './imgs/banners/confianclientepc2.webp',
                        tipo: 'desktop',
                        orden: 2,
                        activo: true,
                        url: ''
                    },
                    {
                        id: 3,
                        titulo: 'Banner Secundario',
                        descripcion: 'Banner secundario promocional',
                        imagen: './imgs/banners/Banner2-.webp',
                        tipo: 'desktop',
                        orden: 3,
                        activo: true,
                        url: ''
                    },
                    {
                        id: 4,
                        titulo: 'Banner Mobile',
                        descripcion: 'Banner para dispositivos móviles',
                        imagen: './imgs/banners/banner1celu.webp',
                        tipo: 'mobile',
                        orden: 1,
                        activo: true,
                        url: ''
                    }
                ];
            }
        })
        .catch(error => {
            console.error('Error al cargar banners:', error);
            bannersActuales = [];
        });
}

// También agrega esta función mejorada para actualizar el dashboard
function actualizarDashboard() {
    // Verificar que los elementos existan antes de actualizarlos
    const totalProductosEl = document.getElementById('totalProductos');
    const totalCategoriasEl = document.getElementById('totalCategorias');
    const productosSinPrecioEl = document.getElementById('productosSinPrecio');
    const ultimaActualizacionEl = document.getElementById('ultimaActualizacion');
    const totalBannersEl = document.getElementById('totalBanners');

    if (totalProductosEl) {
        const totalProductos = Object.values(productosActuales).flat().length;
        totalProductosEl.textContent = totalProductos;
    }
    
    if (totalCategoriasEl) {
        const totalCategorias = Object.keys(categoriasActuales).length;
        totalCategoriasEl.textContent = totalCategorias;
    }
    
    if (productosSinPrecioEl) {
        const productosSinPrecio = Object.values(productosActuales).flat().filter(p => !p.precio || p.precio <= 0).length;
        productosSinPrecioEl.textContent = productosSinPrecio;
    }
    
    if (ultimaActualizacionEl) {
        const ultimaActualizacion = localStorage.getItem('ultimaActualizacion') || 'Nunca';
        ultimaActualizacionEl.textContent = ultimaActualizacion;
    }
    
    if (totalBannersEl) {
        const totalBanners = bannersActuales.length;
        totalBannersEl.textContent = totalBanners;
    }
    
    console.log('Dashboard actualizado - Categorías:', Object.keys(categoriasActuales).length);
}

// Función para cargar la tabla de productos
function cargarTablaProductos() {
    const tabla = document.getElementById('tablaProductos');
    const filtroCategoria = document.getElementById('filtroCategoria');
    
    if (!tabla) {
        return;
    }
    
    // Llenar filtro de categorías
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    Object.keys(categoriasActuales).forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoriasActuales[categoria].nombre;
        filtroCategoria.appendChild(option);
    });

    // Llenar tabla
    tabla.innerHTML = '';
    
    // Si no hay productos en localStorage, usar los del archivo productos.js
    if (Object.keys(productosActuales).length === 0 && typeof productos !== 'undefined') {
        Object.keys(productos).forEach(categoria => {
            if (!productosActuales[categoria]) {
                productosActuales[categoria] = [];
            }
            productos[categoria].forEach(producto => {
                const productoConPrecio = {
                    ...producto,
                    precio: producto.precio || 0,
                    categoria: categoria
                };
                productosActuales[categoria].push(productoConPrecio);
            });
        });
        guardarProductosEnServidor();
    }
    
    let totalProductos = 0;
    
    Object.keys(productosActuales).forEach(categoria => {
        productosActuales[categoria].forEach(producto => {
            totalProductos++;
            
            // Manejar imagen del producto
            let imagenSrc = producto.imagen || '../imgs/productos/default.jpg';
            
            // Si la imagen no existe o es la default, usar una imagen placeholder
            if (!producto.imagen || producto.imagen === '../imgs/productos/default.jpg') {
                imagenSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q3RDciLz4KPHBhdGggZD0iTTM1IDM1SDY1VjY1SDM1VjM1WiIgZmlsbD0iI0M4QzhDOCIvPgo8L3N2Zz4K';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-imagen" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q3RDciLz4KPHBhdGggZD0iTTM1IDM1SDY1VjY1SDM1VjM1WiIgZmlsbD0iI0M4QzhDOCIvPgo8L3N2Zz4K'">
                </td>
                <td>${producto.nombre}</td>
                <td>${categoriasActuales[categoria]?.nombre || categoria}</td>
                <td>
                    <input type="number" class="form-control price-input" value="${producto.precio || ''}" 
                           step="0.01" min="0" onchange="actualizarPrecio('${categoria}', '${producto.descripcion}', this.value)">
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editarProducto('${categoria}', '${producto.descripcion}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${categoria}', '${producto.descripcion}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tabla.appendChild(row);
        });
    });
    
    if (totalProductos === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron productos.</td></tr>';
    }
}

// Función para actualizar precio de un producto
function actualizarPrecio(categoria, descripcion, precio) {
    const producto = productosActuales[categoria].find(p => p.descripcion === descripcion);
    if (producto) {
        const precioAnterior = producto.precio;
        producto.precio = parseFloat(precio) || 0;
        
        // Guardar en el servidor via PHP
        guardarProductosEnServidor();
        
        // Actualizar dashboard
        actualizarDashboard();
        
        // Mostrar feedback visual
        const input = event.target;
        const originalColor = input.style.backgroundColor;
        input.style.backgroundColor = '#d4edda'; // Verde claro
        input.style.borderColor = '#28a745';
        
        setTimeout(() => {
            input.style.backgroundColor = originalColor;
            input.style.borderColor = '';
        }, 1000);
        
        console.log(`Precio actualizado: ${producto.nombre} - $${precioAnterior} → $${producto.precio}`);
        
        // Mostrar mensaje de confirmación
        mostrarMensajePrecioActualizado(producto.nombre, producto.precio);
    } else {
        console.error('Producto no encontrado:', categoria, descripcion);
    }
}

// Función para mostrar mensaje de precio actualizado
function mostrarMensajePrecioActualizado(nombre, precio) {
    const mensaje = document.createElement('div');
    mensaje.className = 'alert alert-success position-fixed';
    mensaje.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    mensaje.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Precio actualizado: <strong>${nombre}</strong><br>
        Nuevo precio: <strong>$${formatearPrecioArgentino(precio)}</strong>
    `;
    
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.remove();
    }, 3000);
}

// Función para formatear precios argentinos (sin decimales, con separadores de miles)
function formatearPrecioArgentino(precio) {
    return precio.toLocaleString('es-AR');
}

// Función para obtener todos los tipos únicos de productos
function obtenerTiposUnicos() {
    const tipos = new Set();
    
    // Recorrer todos los productos existentes para obtener tipos únicos
    Object.values(productosActuales).forEach(categoria => {
        categoria.forEach(producto => {
            if (producto.tipo && producto.tipo.trim() !== '') {
                tipos.add(producto.tipo.trim());
            }
        });
    });
    
    // Agregar tipos comunes que podrían no estar en los productos actuales
    const tiposComunes = [
        'higienico', 'bobina', 'servilleta', 'intercalada', 'Papeltermico',
        'latex', 'Nitrilo', 'Seguridad', 'Higiene', 'Latex',
        'Desinfectantes', 'Desodorantesdepiso', 'Cera', 'Antigrasa', 
        'Jabondemano', 'Detergente', 'Cloro', 'Lavandina', 'Alcohol',
        'Dispenser', 'Pulverizador', 'Regadera', 'Canasto', 'Tanque',
        'Cono', 'delineador', 'tachas', 'topes', 'Valla',
        'Zapato', 'Seguridadvial', 'Anteojos',
        'Mopas', 'Trapos', 'Balde', 'Escobillon', 'Secadores', 
        'Cabos', 'Esponjas', 'Sopapa', 'Cepillo', 'Carro', 'Señales',
        'Aspiradoras', 'Compresores', 'Escalera', 'Taladro',
        'PapelImpresora', 'Max Aroma', 'Wurth'
    ];
    
    tiposComunes.forEach(tipo => tipos.add(tipo));
    
    return Array.from(tipos).sort();
}

// Función para mostrar modal de producto
function mostrarModalProducto(producto = null) {
    productoEditando = producto;
    const modal = document.getElementById('modalProducto');
    const titulo = document.getElementById('modalProductoTitulo');
    
    if (producto) {
        titulo.textContent = 'Editar Producto';
        // Llenar formulario con datos del producto
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion;
        document.getElementById('productoPrecio').value = producto.precio || '';
        document.getElementById('productoTipo').value = producto.tipo || '';
        document.getElementById('productoMarca').value = producto.marca || '';
        // Seleccionar categoría
        const categoriaSelect = document.getElementById('productoCategoria');
        categoriaSelect.value = producto.categoria || '';
        
        // Mostrar imagen actual si existe
        const previewImagen = document.getElementById('previewImagen');
        if (producto.imagen && producto.imagen !== '../imgs/productos/default.jpg') {
            previewImagen.src = producto.imagen;
            previewImagen.classList.remove('d-none');
        } else {
            previewImagen.classList.add('d-none');
        }
    } else {
        titulo.textContent = 'Agregar Producto';
        document.getElementById('formProducto').reset();
        document.getElementById('previewImagen').classList.add('d-none');
    }
    
    // Llenar opciones de categorías
    const categoriaSelect = document.getElementById('productoCategoria');
    categoriaSelect.innerHTML = '';
    Object.keys(categoriasActuales).forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoriasActuales[categoria].nombre;
        categoriaSelect.appendChild(option);
    });
    
    // Llenar opciones de tipos según categoría seleccionada
    const tipoSelect = document.getElementById('productoTipo');
    const categoriaInicial = categoriaSelect.value;
    llenarTiposParaCategoria(categoriaInicial, tipoSelect, producto?.tipo || '');

    // Actualizar tipos cuando cambia la categoría
    categoriaSelect.onchange = () => {
        llenarTiposParaCategoria(categoriaSelect.value, tipoSelect, '');
    };
    
    // Configurar el input de imagen para preview
    configurarInputImagen();
    
    new bootstrap.Modal(modal).show();
}

// Devuelve lista de tipos definidos para una categoría (local) con fallback
function obtenerTiposParaCategoria(categoriaClave) {
    const categoria = categoriasActuales[categoriaClave];
    let tipos = [];
    if (categoria && Array.isArray(categoria.tipos) && categoria.tipos.length > 0) {
        tipos = categoria.tipos.slice();
    } else {
        // Fallback: calcular a partir de productos existentes de esa categoría
        const tiposSet = new Set();
        if (productosActuales[categoriaClave]) {
            productosActuales[categoriaClave].forEach(p => {
                if (p.tipo && p.tipo.trim() !== '') tiposSet.add(p.tipo.trim());
            });
        }
        tipos = Array.from(tiposSet);
    }
    return tipos.sort();
}

// Rellena las opciones del select de tipos para una categoría dada
function llenarTiposParaCategoria(categoriaClave, tipoSelect, tipoSeleccionado) {
    tipoSelect.innerHTML = '<option value="">Seleccionar tipo...</option>';
    const tipos = obtenerTiposParaCategoria(categoriaClave);
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoSelect.appendChild(option);
    });
    if (tipoSeleccionado) {
        // Si el tipo no está en la lista, añadirlo temporalmente para poder seleccionarlo
        if (!tipos.includes(tipoSeleccionado)) {
            const opt = document.createElement('option');
            opt.value = tipoSeleccionado;
            opt.textContent = tipoSeleccionado;
            tipoSelect.appendChild(opt);
        }
        tipoSelect.value = tipoSeleccionado;
    }
}

// --- Gestión de Tipos (Modal) ---
function mostrarModalTipos(preselectCategoriaClave = '') {
    // Asegurar que cada categoría tenga arreglo de tipos
    Object.keys(categoriasActuales).forEach(k => {
        if (!Array.isArray(categoriasActuales[k].tipos)) categoriasActuales[k].tipos = [];
    });
    // Llenar select de categorías
    const select = document.getElementById('tipoCategoriaSelect');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(categoriasActuales).forEach(clave => {
        const opt = document.createElement('option');
        opt.value = clave;
        opt.textContent = categoriasActuales[clave].nombre;
        select.appendChild(opt);
    });
    if (preselectCategoriaClave && categoriasActuales[preselectCategoriaClave]) {
        select.value = preselectCategoriaClave;
    }
    // Render listado de tipos
    renderTiposListado();
    // Cambiar render al cambiar categoría
    select.onchange = renderTiposListado;
    new bootstrap.Modal(document.getElementById('modalTipos')).show();
}

function renderTiposListado() {
    const cont = document.getElementById('tiposListadoContainer');
    if (!cont) return;
    const select = document.getElementById('tipoCategoriaSelect');
    const clave = select ? select.value : '';
    const categoria = categoriasActuales[clave];
    const tipos = (categoria && Array.isArray(categoria.tipos)) ? categoria.tipos : [];
    let html = '<div class="mt-2">';
    if (tipos.length === 0) {
        html += '<p class="text-muted">No hay tipos definidos para esta categoría.</p>';
    } else {
        html += '<div class="d-flex flex-wrap gap-2">';
        tipos.forEach(t => {
            html += `<span class=\"badge bg-secondary\">${t}
                <button type=\"button\" class=\"btn btn-sm btn-light ms-1 py-0 px-1\" onclick=\"editarTipo('${clave}','${t.replace(/'/g, "\\'")}')\"><i class=\"fas fa-pen\"></i></button>
                <button type=\"button\" class=\"btn btn-sm btn-light ms-1 py-0 px-1\" onclick=\"eliminarTipo('${clave}','${t.replace(/'/g, "\\'")}')\"><i class=\"fas fa-times\"></i></button>
            </span>`;
        });
        html += '</div>';
    }
    html += '</div>';
    cont.innerHTML = html;
}

function guardarTipo() {
    const clave = document.getElementById('tipoCategoriaSelect').value;
    const input = document.getElementById('tipoNombre');
    const nombre = (input.value || '').trim();
    if (!clave) { alert('Seleccione una categoría'); return; }
    if (!nombre) { alert('Ingrese un nombre de tipo'); return; }
    if (!Array.isArray(categoriasActuales[clave].tipos)) categoriasActuales[clave].tipos = [];
    if (!categoriasActuales[clave].tipos.includes(nombre)) {
        categoriasActuales[clave].tipos.push(nombre);
        categoriasActuales[clave].tipos.sort();
        guardarCategoriasEnServidor(() => {
            renderTiposListado();
            input.value = '';
            // Sincronizar el nuevo tipo en productos.json
            sincronizarTiposEnProductos(clave, null, nombre);
        });
    } else {
        alert('Ese tipo ya existe en la categoría.');
    }
}

function eliminarTipo(clave, tipo) {
    if (!categoriasActuales[clave] || !Array.isArray(categoriasActuales[clave].tipos)) return;
    categoriasActuales[clave].tipos = categoriasActuales[clave].tipos.filter(t => t !== tipo);
    guardarCategoriasEnServidor(() => {
        renderTiposListado();
    });
}

function editarTipo(clave, tipoActual) {
    const nuevoNombre = prompt('Editar tipo', tipoActual);
    if (nuevoNombre === null) return; // cancelado
    const nombre = (nuevoNombre || '').trim();
    if (!nombre) { alert('El nombre no puede estar vacío'); return; }
    if (!categoriasActuales[clave] || !Array.isArray(categoriasActuales[clave].tipos)) return;
    const tipos = categoriasActuales[clave].tipos;
    const idx = tipos.indexOf(tipoActual);
    if (idx === -1) return;
    if (tipos.includes(nombre) && nombre !== tipoActual) {
        alert('Ya existe un tipo con ese nombre en la categoría');
        return;
    }
    tipos[idx] = nombre;
    tipos.sort();
    guardarCategoriasEnServidor(() => {
        renderTiposListado();
        // Sincronizar el cambio de tipo en productos.json
        sincronizarTiposEnProductos(clave, tipoActual, nombre);
    });
}

// Guardar categorías en servidor
function guardarCategoriasEnServidor(callback) {
    fetch('guardar_categorias.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorias: categoriasActuales })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) {
            alert('Error al guardar categorías: ' + (data.error || 'desconocido'));
        }
        if (typeof callback === 'function') callback();
    })
    .catch(() => {
        alert('Error de conexión al guardar categorías');
        if (typeof callback === 'function') callback();
    });
}

// Función para configurar el input de imagen
function configurarInputImagen() {
    const inputImagen = document.getElementById('productoImagen');
    const previewImagen = document.getElementById('previewImagen');
    
    inputImagen.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Crear preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImagen.src = e.target.result;
                previewImagen.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        } else {
            previewImagen.classList.add('d-none');
        }
    });
}

// Función para guardar producto
function guardarProducto() {
    const nombre = document.getElementById('productoNombre').value;
    const descripcion = document.getElementById('productoDescripcion').value;
    const precio = parseFloat(document.getElementById('productoPrecio').value) || 0;
    const categoria = document.getElementById('productoCategoria').value;
    const tipo = document.getElementById('productoTipo').value;
    const marca = document.getElementById('productoMarca').value;
    const inputImagen = document.getElementById('productoImagen');
    
    if (!nombre || !descripcion || !categoria) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Manejar la imagen
    let imagenPath = productoEditando ? productoEditando.imagen : '../imgs/productos/default.jpg';
    
    if (inputImagen.files.length > 0) {
        // Si hay una nueva imagen, subirla
        subirImagen(inputImagen.files[0], categoria, function(nuevaImagenPath) {
            guardarProductoConImagen(nombre, descripcion, precio, categoria, tipo, marca, nuevaImagenPath);
        });
    } else {
        // Si no hay nueva imagen, usar la existente
        guardarProductoConImagen(nombre, descripcion, precio, categoria, tipo, marca, imagenPath);
    }
}

// Función para subir imagen
function subirImagen(file, categoria, callback) {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('categoria', categoria);
    
    fetch('subir_imagen.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            callback(data.ruta);
        } else {
            console.error('Error al subir imagen:', data.error);
            callback('../imgs/productos/default.jpg');
        }
    })
    .catch(error => {
        console.error('Error al subir imagen:', error);
        callback('../imgs/productos/default.jpg');
    });
}

// Función para guardar producto con imagen
function guardarProductoConImagen(nombre, descripcion, precio, categoria, tipo, marca, imagenPath) {
    const nuevoProducto = {
        nombre,
        descripcion,
        precio,
        tipo,
        marca,
        categoria,
        imagen: imagenPath
    };
    
    if (productoEditando) {
        // Editar producto existente
        const categoriaAnterior = productoEditando.categoria || Object.keys(productosActuales).find(cat => 
            productosActuales[cat].some(p => p.descripcion === productoEditando.descripcion)
        );
        
        if (categoriaAnterior && productosActuales[categoriaAnterior]) {
            const index = productosActuales[categoriaAnterior].findIndex(p => p.descripcion === productoEditando.descripcion);
            if (index !== -1) {
                productosActuales[categoriaAnterior][index] = nuevoProducto;
            }
        }
    } else {
        // Agregar nuevo producto
        if (!productosActuales[categoria]) {
            productosActuales[categoria] = [];
        }
        productosActuales[categoria].push(nuevoProducto);
    }
    
    guardarProductosEnServidor();
    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
    cargarTablaProductos();
    actualizarDashboard();
}

// Función para editar producto
function editarProducto(categoria, descripcion) {
    const producto = productosActuales[categoria].find(p => p.descripcion === descripcion);
    if (producto) {
        producto.categoria = categoria;
        mostrarModalProducto(producto);
    }
}

// Función para eliminar producto
function eliminarProducto(categoria, descripcion) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        productosActuales[categoria] = productosActuales[categoria].filter(p => p.descripcion !== descripcion);
        guardarProductosEnServidor();
        cargarTablaProductos();
        actualizarDashboard();
    }
}

// Función para mostrar modal de categoría
function mostrarModalCategoria() {
    document.getElementById('formCategoria').reset();
    new bootstrap.Modal(document.getElementById('modalCategoria')).show();
}

// Función para guardar categoría
function guardarCategoria() {
    const nombre = document.getElementById('categoriaNombre').value;
    const descripcion = document.getElementById('categoriaDescripcion').value;
    const icono = document.getElementById('categoriaIcono').value;
    
    if (!nombre) {
        alert('Por favor ingresa el nombre de la categoría');
        return;
    }
    
    const nuevaCategoria = {
        nombre,
        descripcion,
        icono: icono || 'fas fa-box',
        tipos: []
    };
    
    // Generar clave única para la categoría
    const clave = nombre.replace(/\s+/g, '');
    categoriasActuales[clave] = nuevaCategoria;
    guardarCategoriasEnServidor(() => {
        bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
        cargarCategoriasGrid();
        actualizarDashboard();
    });
}

// Función para cargar grid de categorías
function cargarCategoriasGrid() {
    const grid = document.getElementById('categoriasGrid');
    grid.innerHTML = '';
    
    Object.keys(categoriasActuales).forEach(clave => {
        const categoria = categoriasActuales[clave];
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        const tiposChips = Array.isArray(categoria.tipos) && categoria.tipos.length > 0
            ? `<div class="mt-2">${categoria.tipos.map(t => `<span class=\"badge bg-secondary me-1\">${t}</span>`).join(' ')}</div>`
            : '';
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">
                                <i class="${categoria.icono} me-2"></i>${categoria.nombre}
                            </h5>
                            <p class="card-text">${categoria.descripcion}</p>
                            ${tiposChips}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="mostrarModalTipos('${clave}')">
                                <i class="fas fa-sitemap"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarCategoria('${clave}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

// Función para eliminar categoría
function eliminarCategoria(clave) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        delete categoriasActuales[clave];
        guardarCategoriasEnServidor(() => {
            cargarCategoriasGrid();
            actualizarDashboard();
        });
    }
}

// Función para aplicar filtros
function aplicarFiltros() {
    const categoria = document.getElementById('filtroCategoria').value;
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const precio = document.getElementById('filtroPrecio').value;
    
    const tabla = document.getElementById('tablaProductos');
    const filas = tabla.querySelectorAll('tr');
    
    filas.forEach(fila => {
        const nombre = fila.cells[1]?.textContent.toLowerCase() || '';
        const categoriaProducto = fila.cells[2]?.textContent || '';
        const precioProducto = fila.querySelector('.price-input')?.value || '';
        
        let mostrar = true;
        
        if (categoria && categoriaProducto !== categoriasActuales[categoria]?.nombre) {
            mostrar = false;
        }
        
        if (busqueda && !nombre.includes(busqueda)) {
            mostrar = false;
        }
        
        if (precio === 'sin-precio' && precioProducto && precioProducto > 0) {
            mostrar = false;
        }
        
        if (precio === 'con-precio' && (!precioProducto || precioProducto <= 0)) {
            mostrar = false;
        }
        
        fila.style.display = mostrar ? '' : 'none';
    });
}

// Función para guardar productos en el servidor
function guardarProductosEnServidor() {
    // No guardar si no hay productos o si está vacío
    if (!productosActuales || Object.keys(productosActuales).length === 0) {
        console.log('No se guardan productos porque productosActuales está vacío');
        return;
    }
    
    // Verificar que realmente hay productos
    const totalProductos = Object.values(productosActuales).flat().length;
    if (totalProductos === 0) {
        console.log('No se guardan productos porque no hay productos en las categorías');
        return;
    }
    
    // Crear una copia de los productos para restaurar las rutas originales
    const productosParaGuardar = {};
    Object.keys(productosActuales).forEach(categoria => {
        productosParaGuardar[categoria] = productosActuales[categoria].map(producto => {
            const productoCopy = { ...producto };
            // Restaurar las rutas originales con '../' para productos.html
            if (productoCopy.imagen && !productoCopy.imagen.startsWith('../') && !productoCopy.imagen.startsWith('http')) {
                productoCopy.imagen = '../' + productoCopy.imagen;
            }
            return productoCopy;
        });
    });
    
    fetch('guardar_precios.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productos: productosParaGuardar
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Productos guardados correctamente en el servidor');
            console.log('Archivo actualizado:', data.archivo);
        } else {
            console.error('Error al guardar productos:', data.error);
            alert('Error al guardar los productos: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert('Error de conexión al guardar productos');
    });
}

// Función para cargar productos desde el servidor
function cargarProductosDesdeServidor() {
    // Los productos ya están cargados por productos-cargador.js
    // Solo sincronizar si no están ya sincronizados
    if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
        productosActuales = productos;
        console.log('Productos sincronizados desde JSON:', productosActuales);
        cargarTablaProductos();
        actualizarDashboard();
    } else {
        console.log('Productos no disponibles aún, esperando...');
    }
}

// Función para guardar configuración
function guardarConfiguracion() {
    const configuracion = {
        moneda: document.getElementById('moneda').value,
        iva: parseFloat(document.getElementById('iva').value)
    };
    localStorage.setItem('configuracion', JSON.stringify(configuracion));
    alert('Configuración guardada correctamente');
}

// Función para exportar datos
function exportarDatos() {
    const datos = {
        productos: productosActuales,
        categorias: categoriasActuales,
        banners: bannersActuales,
        configuracion: JSON.parse(localStorage.getItem('configuracion') || '{}'),
        fecha: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecogroup_datos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Función para importar datos
function importarDatos() {
    document.getElementById('archivoImportar').click();
}

// Evento para manejar la importación de archivos
document.getElementById('archivoImportar').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const datos = JSON.parse(e.target.result);
                if (datos.productos) {
                    productosActuales = datos.productos;
                    localStorage.setItem('productosConPrecios', JSON.stringify(productosActuales));
                }
                if (datos.categorias) {
                    categoriasActuales = datos.categorias;
                    localStorage.setItem('categorias', JSON.stringify(categoriasActuales));
                }
                if (datos.banners) {
                    bannersActuales = datos.banners;
                    guardarBanners(); // Usar la función que guarda en el servidor
                }
                if (datos.configuracion) {
                    localStorage.setItem('configuracion', JSON.stringify(datos.configuracion));
                }
                
                alert('Datos importados correctamente');
                cargarTablaProductos();
                cargarCategoriasGrid();
                cargarBannersGrid();
                actualizarDashboard();
            } catch (error) {
                alert('Error al importar el archivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});

// Función para sincronizar con productos.js existente
function sincronizarConProductosExistentes() {
    // Esta función se llamará cuando se detecte que hay productos en productos.js
    // que no están en el localStorage
    if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
        // Solo sincronizar si productosActuales está vacío o incompleto
        const productosActualesVacios = !productosActuales || Object.keys(productosActuales).length === 0;
        
        if (productosActualesVacios) {
            productosActuales = productos;
            console.log('Productos sincronizados desde JSON:', Object.keys(productosActuales));
        } else {
            // Solo agregar productos que no existan
            Object.keys(productos).forEach(categoria => {
                if (!productosActuales[categoria]) {
                    productosActuales[categoria] = [];
                }
                
                productos[categoria].forEach(producto => {
                    const existe = productosActuales[categoria].some(p => p.descripcion === producto.descripcion);
                    if (!existe) {
                        productosActuales[categoria].push({
                            ...producto,
                            precio: producto.precio || 0,
                            categoria: categoria
                        });
                    }
                });
            });
        }
        
        // Solo guardar si realmente hay datos completos
        if (productosActuales && Object.keys(productosActuales).length > 0) {
            const totalProductos = Object.values(productosActuales).flat().length;
            if (totalProductos > 50) { // Solo guardar si hay una cantidad razonable de productos
                guardarProductosEnServidor();
            }
        }
        
        // Solo actualizar la tabla si estamos en la sección de productos
        const productosSection = document.getElementById('productosSection');
        if (productosSection && !productosSection.classList.contains('d-none')) {
            cargarTablaProductos();
        }
        actualizarDashboard();
    }
}

// Función para cargar grid de banners
function cargarBannersGrid() {
    const grid = document.getElementById('bannersGrid');
    grid.innerHTML = '';
    
    bannersActuales.sort((a, b) => a.orden - b.orden).forEach(banner => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <img src="${banner.imagen}" class="card-img-top" alt="${banner.titulo}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${banner.titulo}</h5>
                    <p class="card-text">${banner.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-${banner.activo ? 'success' : 'secondary'}">${banner.activo ? 'Activo' : 'Inactivo'}</span>
                        <span class="badge bg-info">${banner.tipo}</span>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-primary me-1" onclick="editarBanner(${banner.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarBanner(${banner.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

// Función para mostrar modal de banner
function mostrarModalBanner(banner = null) {
    bannerEditando = banner;
    const modal = document.getElementById('modalBanner');
    const titulo = document.getElementById('modalBannerTitulo');
    
    if (banner) {
        titulo.textContent = 'Editar Banner';
        document.getElementById('bannerTitulo').value = banner.titulo;
        document.getElementById('bannerDescripcion').value = banner.descripcion;
        document.getElementById('bannerTipo').value = banner.tipo;
        document.getElementById('bannerOrden').value = banner.orden;
        document.getElementById('bannerUrl').value = banner.url || '';
        document.getElementById('bannerActivo').checked = banner.activo;
        
        const preview = document.getElementById('previewBannerImagen');
        preview.src = banner.imagen;
        preview.classList.remove('d-none');
    } else {
        titulo.textContent = 'Agregar Banner';
        document.getElementById('formBanner').reset();
        document.getElementById('previewBannerImagen').classList.add('d-none');
        // Limpiar el input de imagen específicamente
        document.getElementById('bannerImagen').value = '';
    }
    
    // Configurar preview de imagen
    configurarPreviewBannerImagen();
    
    new bootstrap.Modal(modal).show();
}

// --- Validación en el input de archivo ---
function configurarPreviewBannerImagen() {
    const imagenInput = document.getElementById('bannerImagen');
    const preview = document.getElementById('previewBannerImagen');
    imagenInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Validar extensión .webp
            if (!file.name.toLowerCase().endsWith('.webp')) {
                alert('Solo se permiten archivos .webp para los banners.');
                this.value = '';
                preview.classList.add('d-none');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('d-none');
        }
    });
}

// Función para guardar banner
function guardarBanner() {
    console.log('guardarBanner llamada');
    const titulo = document.getElementById('bannerTitulo').value;
    const descripcion = document.getElementById('bannerDescripcion').value;
    const tipo = document.getElementById('bannerTipo').value;
    const orden = parseInt(document.getElementById('bannerOrden').value);
    const url = document.getElementById('bannerUrl').value;
    const activo = document.getElementById('bannerActivo').checked;
    const imagenInput = document.getElementById('bannerImagen');
    
    if (!titulo) {
        alert('Por favor ingresa el título del banner');
        return;
    }
    
    // Procesar imagen si se seleccionó una nueva
    if (imagenInput.files.length > 0) {
        const file = imagenInput.files[0];
        console.log('Imagen seleccionada para subir:', file.name);
        subirImagenBanner(file, (imagenPath) => {
            console.log('Callback de subirImagenBanner, imagenPath:', imagenPath);
            guardarBannerConImagen(titulo, descripcion, tipo, orden, url, activo, imagenPath);
        });
    } else {
        // Usar imagen existente o por defecto
        const imagen = bannerEditando ? bannerEditando.imagen : './imgs/banners/default-banner.jpg';
        console.log('No se seleccionó nueva imagen, usando:', imagen);
        guardarBannerConImagen(titulo, descripcion, tipo, orden, url, activo, imagen);
    }
}

// --- En subirImagenBanner ---
function subirImagenBanner(file, callback) {
    console.log('subirImagenBanner llamada');
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('categoria', 'banners');
    
    // Si estamos editando un banner, usar el nombre original del archivo
    if (bannerEditando && bannerEditando.imagen) {
        // Extraer solo el nombre del archivo de la ruta completa
        const rutaImagen = bannerEditando.imagen.replace('./imgs/banners/', '').replace('imgs/banners/', '');
        const nombreArchivo = rutaImagen.split('/').pop(); // Obtener solo el nombre del archivo
        formData.append('nombre_archivo', nombreArchivo);
        console.log('Sobrescribiendo archivo con nombre:', nombreArchivo);
        console.log('Banner editando imagen original:', bannerEditando.imagen);
    } else {
        console.log('Subiendo nueva imagen de banner (no editando)');
    }
    fetch('subir_imagen.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta de subir_imagen.php:', data);
        if (data.success) {
            callback(data.ruta);
        } else {
            alert('Error al subir la imagen: ' + data.error);
            callback('./imgs/banners/default-banner.jpg');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al subir la imagen');
        callback('./imgs/banners/default-banner.jpg');
    });
}

// Función para guardar banner con imagen
function guardarBannerConImagen(titulo, descripcion, tipo, orden, url, activo, imagen) {
    const nuevoBanner = {
        id: bannerEditando ? bannerEditando.id : Date.now(),
        titulo,
        descripcion,
        tipo,
        orden,
        url,
        activo,
        imagen: imagen
    };
    
    if (bannerEditando) {
        // Editar banner existente
        const index = bannersActuales.findIndex(b => b.id === bannerEditando.id);
        if (index !== -1) {
            bannersActuales[index] = nuevoBanner;
        }
    } else {
        // Agregar nuevo banner
        bannersActuales.push(nuevoBanner);
    }
    
    guardarBanners();
    bootstrap.Modal.getInstance(document.getElementById('modalBanner')).hide();
    cargarBannersGrid();
    actualizarDashboard();
}

// Función para editar banner
function editarBanner(id) {
    const banner = bannersActuales.find(b => b.id === id);
    if (banner) {
        mostrarModalBanner(banner);
    }
}

// Función para eliminar banner
function eliminarBanner(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
        bannersActuales = bannersActuales.filter(b => b.id !== id);
        guardarBanners();
        cargarBannersGrid();
    }
}

// Función para guardar banners en el servidor
function guardarBanners() {
    // No guardar si no hay banners o si está vacío
    if (!bannersActuales || bannersActuales.length === 0) {
        console.log('No se guardan banners porque bannersActuales está vacío');
        return;
    }
    
    fetch('guardar_banners.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            banners: bannersActuales
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Banners guardados correctamente en el servidor');
            console.log('Archivo actualizado:', data.archivo);
            localStorage.setItem('ultimaActualizacion', new Date().toLocaleString('es-AR'));
        } else {
            console.error('Error al guardar banners:', data.error);
            alert('Error al guardar los banners: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error en la petición:', error);
        alert('Error de conexión al guardar banners');
    });
}

// Función para forzar recarga de productos
function forzarRecargaProductos() {
    productosActuales = {};
    localStorage.removeItem('productosConPrecios');
    sincronizarConProductosExistentes();
    cargarTablaProductos();
}

// Función para verificar precios guardados
function verificarPreciosGuardados() {
    const productosGuardados = localStorage.getItem('productosConPrecios');
    if (productosGuardados) {
        const productos = JSON.parse(productosGuardados);
        console.log('=== PRODUCTOS GUARDADOS ===');
        Object.keys(productos).forEach(categoria => {
            productos[categoria].forEach(producto => {
                if (producto.precio > 0) {
                    console.log(`${producto.nombre}: $${formatearPrecioArgentino(producto.precio)}`);
                }
            });
        });
        console.log('==========================');
    } else {
        console.log('No hay productos guardados en localStorage');
    }
}

// Función para limpiar todos los precios (resetear a 0)
function limpiarTodosLosPrecios() {
    if (confirm('¿Estás seguro de que quieres resetear todos los precios a 0?')) {
        Object.keys(productosActuales).forEach(categoria => {
            productosActuales[categoria].forEach(producto => {
                producto.precio = 0;
            });
        });
        guardarProductosEnServidor();
        cargarTablaProductos();
        actualizarDashboard();
        alert('Todos los precios han sido reseteados a 0');
    }
}

// Comentamos esta llamada automática para evitar sobrescribir el archivo constantemente
// setTimeout(sincronizarConProductosExistentes, 1000);

// Función para generar archivo JavaScript actualizado
function generarArchivoJS() {
    try {
        // Crear el contenido del archivo JavaScript
        let contenido = '// Función para formatear precios argentinos (sin decimales, con separadores de miles)\n';
        contenido += 'function formatearPrecioArgentino(precio) {\n';
        contenido += '    return precio.toLocaleString(\'es-AR\');\n';
        contenido += '}\n\n';
        contenido += 'const productos = ' + JSON.stringify(productosActuales, null, 4) + ';\n\n';
        
        // Agregar todas las funciones del archivo original
        contenido += `// Función para cargar productos iniciales o por filtros
function cargarProductos() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    const tipo = urlParams.get('tipo');
    const marca = urlParams.get('marca');

    const container = document.getElementById('productos-container');
    container.innerHTML = ''; // Limpiar el contenedor

    // Determinar qué productos mostrar
    let productosFiltrados = [];
    if (categoria) {
        productosFiltrados = productos[categoria] || [];
    } else if (marca) {
        // Si no hay categoría pero sí hay marca, buscar en todas las categorías
        productosFiltrados = Object.values(productos).flat().filter(producto => producto.marca === marca);
    } else {
        // Si no hay ni categoría ni marca, mostrar todos los productos
        productosFiltrados = Object.values(productos).flat();
    }

    // Aplicar filtro adicional por tipo si está presente
    if (tipo) {
        productosFiltrados = productosFiltrados.filter(producto => producto.tipo === tipo);
    }

    mostrarProductos(productosFiltrados);
}

// Función para mostrar productos en el contenedor
function mostrarProductos(productosFiltrados) {
    const container = document.getElementById('productos-container');
    container.innerHTML = ''; // Limpiar el contenedor

    if (productosFiltrados.length === 0) {
        container.innerHTML = '<p>No se encontraron productos que coincidan con tu búsqueda.</p>';
        return;
    }

    const row = document.createElement('div');
    row.className = 'row row-cols-2 row-cols-md-3 g-4 margentop';

    productosFiltrados.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = \`
            <div class="card h-100">
                <img src="\${producto.imagen}" class="card-img-top" style="object-fit: scale-down;" alt="\${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-center">\${producto.nombre}</h5>
                    <p class="card-text text-center flex-grow-1">\${producto.descripcion}</p>
                    \${producto.precio && producto.precio > 0 ? \`<p class="card-text text-center text-success fw-bold">\$\${formatearPrecioArgentino(producto.precio)}</p>\` : ''}
                    <div class="mt-auto text-center">
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" value="1" min="1" id="cantidad-\${producto.descripcion.replace(/\\s+/g, '-')}">
                            <button class="btn btn-primary boton-agregar" onclick="agregarAlCarrito('\${producto.descripcion.replace(/\\s+/g, '-')}', parseInt(document.getElementById('cantidad-\${producto.descripcion.replace(/\\s+/g, '-')}').value))">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>\`;
        row.appendChild(col);
    });

    container.appendChild(row);
}

// Función para buscar productos al hacer clic en el botón
function buscarProductos(query) {
    const productosTodos = Object.values(productos).flat(); // Combinar todas las categorías

    // Filtrar productos que coincidan con la búsqueda
    const resultados = productosTodos.filter(producto => {
        const nombre = producto.nombre ? producto.nombre.toLowerCase() : '';
        const descripcion = producto.descripcion ? producto.descripcion.toLowerCase() : '';
        const marca = producto.marca ? producto.marca.toLowerCase() : '';
        const tipo = producto.tipo ? producto.tipo.toLowerCase() : '';

        return (
            nombre.includes(query) ||
            descripcion.includes(query) ||
            marca.includes(query) ||
            tipo.includes(query)
        );
    });

    mostrarProductos(resultados);
}

function agregarAlCarrito(descripcion, cantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productoExistente = carrito.find(item => item.descripcion.replace(/\\s+/g, '-') === descripcion);
    
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        const productoCompleto = Object.values(productos).flat().find(p => p.descripcion.replace(/\\s+/g, '-') === descripcion);
        carrito.push({ ...productoCompleto, cantidad });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarIconoCarrito();
    mostrarCarrito();
    mostrarMensajeAgregado();
}

// Function to show "Added to cart" message
function mostrarMensajeAgregado() {
    const mensaje = document.createElement('div');
    mensaje.textContent = 'Agregado al carrito';
    mensaje.className = 'mensaje-agregado';
    document.body.appendChild(mensaje);
    setTimeout(() => {
        mensaje.remove();
    }, 2000);
}

// Function to update cart icon
function actualizarIconoCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function mostrarCarrito() {
    const cartItems = document.getElementById('cart-items');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    cartItems.innerHTML = '';

    if (carrito.length === 0) {
        cartItems.innerHTML = '<p>El carrito está vacío.</p>';
        return;
    }
    
    let total = 0;
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item d-flex align-items-center mb-3';
        itemElement.innerHTML = \`
            <img src="\${item.imagen}" alt="\${item.nombre}" class="cart-item-image me-3" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-0">\${item.nombre}</h6>
                <p class="mb-0">\${item.descripcion}</p>
                <p class="mb-0 text-success fw-bold">Precio: \$\${formatearPrecioArgentino(precio)}</p>
                <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="actualizarCantidad('\${item.descripcion}', -1)" \${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <span class="cantidad-item">\${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="actualizarCantidad('\${item.descripcion}', 1)">+</button>
                    <span class="ms-2 text-success fw-bold">Subtotal: \$\${formatearPrecioArgentino(subtotal)}</span>
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito('\${item.descripcion}')">Eliminar</button>
        \`;
        cartItems.appendChild(itemElement);
    });
    
    // Agregar total al final
    const totalElement = document.createElement('div');
    totalElement.className = 'text-end mt-3 p-3 bg-light border-top';
    totalElement.innerHTML = \`<h5 class="text-success fw-bold">Total: \$\${formatearPrecioArgentino(total)}</h5>\`;
    cartItems.appendChild(totalElement);
}

function actualizarCantidad(descripcion, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.descripcion === descripcion);
    
    if (index !== -1) {
        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarIconoCarrito();
        mostrarCarrito();
    }
}

function eliminarDelCarrito(descripcion) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.descripcion !== descripcion);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarIconoCarrito();
    mostrarCarrito();
}

// Function to send quote
function enviarCotizacion() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agregue productos antes de enviar la cotización.');
        return;
    }

    const opcionesEnvio = document.createElement('div');
    opcionesEnvio.innerHTML = \`
        <h5>Seleccione el método de envío:</h5>
        <button id="enviar-correo" class="btn btn-primary me-2">Enviar por correo</button>
        <button id="enviar-whatsapp" class="btn btn-success">Enviar por WhatsApp</button>
    \`;

    const modalBody = document.querySelector('.modal-body');
    modalBody.appendChild(opcionesEnvio);

    document.getElementById('enviar-correo').addEventListener('click', enviarPorCorreo);
    document.getElementById('enviar-whatsapp').addEventListener('click', enviarPorWhatsApp);
}

function enviarPorCorreo() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let mensaje = 'Solicitud de cotización:\\n\\n';
    let total = 0;
    
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += \`\${item.nombre} - \${item.descripcion} - Cantidad: \${item.cantidad} - Precio: \$\${formatearPrecioArgentino(precio)} - Subtotal: \$\${formatearPrecioArgentino(subtotal)}\\n\`;
    });
    
    mensaje += \`\\nTotal: \$\${formatearPrecioArgentino(total)}\`;

    const mailtoLink = \`mailto:info@ecogroupservice.com.ar?subject=Solicitud de Cotización&body=\${encodeURIComponent(mensaje)}\`;
    window.location.href = mailtoLink;

}

function enviarPorWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let mensaje = 'Solicitud de cotización:\\n\\n';
    let total = 0;
    
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += \`\${item.nombre} - \${item.descripcion} - Cantidad: \${item.cantidad} - Precio: \$\${formatearPrecioArgentino(precio)} - Subtotal: \$\${formatearPrecioArgentino(subtotal)}\\n\`;
    });
    
    mensaje += \`\\nTotal: \$\${formatearPrecioArgentino(total)}\`;

    const whatsappLink = \`https://wa.me/5491136267653?text=\${encodeURIComponent(mensaje)}\`;
    window.open(whatsappLink, '_blank');

}

function limpiarCarrito() {
    localStorage.removeItem('carrito');
    actualizarIconoCarrito();
    mostrarCarrito();
}

// Main logic when loading the page
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos(); // Load initial products

    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    // Listen for click on search button
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        buscarProductos(query);
    });

    // Listen for "Enter" event in search field
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form behavior
            const query = searchInput.value.trim().toLowerCase();
            buscarProductos(query);
        }
    });

    // Initialize cart icon and modal
    actualizarIconoCarrito();
    document.getElementById('cart-icon').addEventListener('click', mostrarCarrito);

    // Add event listener for sending quote
    document.getElementById('send-quote').addEventListener('click', enviarCotizacion);
});\n`;
        
        // Crear el blob y descargar
        const blob = new Blob([contenido], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'productos_actualizado.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Archivo productos_actualizado.js generado y descargado. Reemplaza el archivo js/productos.js con este nuevo archivo.');
        
    } catch (error) {
        console.error('Error al generar archivo:', error);
        alert('Error al generar el archivo: ' + error.message);
    }
}

// Función para sincronizar tipos entre categorias.json y productos.json
function sincronizarTiposEnProductos(categoria, tipoAnterior, tipoNuevo) {
    // Si es un tipo nuevo (tipoAnterior es null), no necesitamos actualizar productos
    if (tipoAnterior === null) {
        console.log(`Tipo nuevo "${tipoNuevo}" agregado a categoría "${categoria}"`);
        return;
    }
    
    // Si es una edición de tipo, actualizar en productos.json
    fetch('actualizar_tipo_productos.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            categoria: categoria,
            tipo_anterior: tipoAnterior,
            tipo_nuevo: tipoNuevo
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`Tipo actualizado exitosamente: "${tipoAnterior}" → "${tipoNuevo}"`);
            console.log(`Productos actualizados: ${data.productos_actualizados}`);
        } else {
            console.error('Error al sincronizar tipos:', data.error);
        }
    })
    .catch(error => {
        console.error('Error al sincronizar tipos:', error);
    });
}

// Función para sincronizar tipos desde productos hacia categorias.json
function sincronizarTiposDesdeProductos() {
    if (!confirm('¿Estás seguro de que quieres sincronizar los tipos desde productos.json hacia categorias.json? Esto actualizará las categorías con los tipos encontrados en los productos.')) {
        return;
    }
    
    fetch('sincronizar_tipos.php?accion=sincronizar')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Sincronización exitosa!\n\nTipos agregados: ${data.tipos_agregados}\nCategorías actualizadas: ${data.categorias_actualizadas}`);
                // Recargar las categorías desde el servidor
                cargarCategoriasDesdeServidor();
            } else {
                alert('Error al sincronizar: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al sincronizar tipos: ' + error.message);
        });
} 