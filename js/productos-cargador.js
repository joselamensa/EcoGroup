// Función para formatear precios argentinos (sin decimales, con separadores de miles)
function formatearPrecioArgentino(precio) {
    return precio.toLocaleString('es-AR');
}

// Función para normalizar rutas de imágenes según la página
function normalizarRutaImagen(rutaImagen, desdeAdmin = false) {
    if (!rutaImagen) return '';
    
    // Si estamos en admin.html, quitar el '../' del inicio
    if (window.location.pathname.includes('admin.html') || desdeAdmin) {
        if (rutaImagen.startsWith('../')) {
            return rutaImagen.substring(3); // Quitar '../'
        }
    }
    
    // Si estamos en productos.html, agregar '../' si no lo tiene
    if (window.location.pathname.includes('productos.html')) {
        if (!rutaImagen.startsWith('../') && !rutaImagen.startsWith('http')) {
            return '../' + rutaImagen;
        }
    }
    
    return rutaImagen;
}

// Variable global para almacenar los productos
let productos = {};

// Función para cargar productos desde el archivo JSON
async function cargarProductosDesdeJSON() {
    try {
        // Determinar la ruta correcta según la página
        let rutaJSON;
        if (window.location.pathname.includes('admin.html')) {
            rutaJSON = 'productos.json';
        } else {
            rutaJSON = '../productos.json';
        }
        
        console.log('Intentando cargar JSON desde:', rutaJSON);
        console.log('URL actual:', window.location.pathname);
        
        const response = await fetch(rutaJSON);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonText = await response.text();
        console.log('JSON raw text (primeros 200 chars):', jsonText.substring(0, 200));
        
        productos = JSON.parse(jsonText);
        console.log('Productos parseados:', productos);
        console.log('Tipo de productos:', typeof productos);
        console.log('Es array?', Array.isArray(productos));
        console.log('Keys:', Object.keys(productos));
        
        // Normalizar rutas de imágenes según la página
        Object.keys(productos).forEach(categoria => {
            productos[categoria].forEach(producto => {
                if (producto.imagen) {
                    if (window.location.pathname.includes('admin.html')) {
                        // En admin, quitar '../' para mostrar correctamente
                        producto.imagen = normalizarRutaImagen(producto.imagen, true);
                    } else if (window.location.pathname.includes('productos.html')) {
                        // En productos, agregar '../' si no lo tiene
                        producto.imagen = normalizarRutaImagen(producto.imagen, false);
                    }
                }
            });
        });
        
        console.log('Productos cargados desde JSON:', productos);
        
        // Sincronizar con el admin si estamos en admin.html
        if (window.location.pathname.includes('admin.html')) {
            sincronizarConAdmin();
        }
        
        // Si estamos en la página de productos, cargarlos
        if (window.location.pathname.includes('productos.html')) {
            console.log('Ejecutando cargarProductos() desde productos.html');
            cargarProductos();
        }
    } catch (error) {
        console.error('Error cargando productos desde JSON:', error);
        // Fallback: cargar productos hardcodeados si falla
        cargarProductosHardcodeados();
    }
}

// Función para sincronizar productos con el admin
function sincronizarConAdmin() {
    // Solo sincronizar si hay productos válidos
    if (!productos || Object.keys(productos).length === 0) {
        console.log('No se sincroniza con admin porque no hay productos válidos');
        return;
    }
    
    const totalProductos = Object.values(productos).flat().length;
    if (totalProductos === 0) {
        console.log('No se sincroniza con admin porque no hay productos en las categorías');
        return;
    }
    
    // Hacer que los productos estén disponibles globalmente para el admin
    window.productosActuales = productos;
    console.log('Productos sincronizados con admin:', productos);
    
    // Actualizar el dashboard si existe
    if (typeof actualizarDashboard === 'function') {
        actualizarDashboard();
    }
    
    // Cargar la tabla de productos si existe
    if (typeof cargarTablaProductos === 'function') {
        cargarTablaProductos();
    }
    
    // Llamar a la función de sincronización del admin
    if (typeof sincronizarConProductosExistentes === 'function') {
        sincronizarConProductosExistentes();
    }
}

// Función de fallback con productos hardcodeados (por si falla la carga del JSON)
function cargarProductosHardcodeados() {
    productos = {
        bolsas: [
            {
                "nombre": "Bolsas Residuo Negra",
                "imagen": "../imgs/productos/bolsas/Bolsas de residuos .jpg",
                "descripcion": "Bolsas 100 x 110 de 40 Micrones x 200 u. ",
                "precio": 1000
            },
            {
                "nombre": "Bolsas Residuo Tambor",
                "imagen": "../imgs/productos/bolsas/Bolsas de residuos .jpg",
                "descripcion": "Bolsas 100 x 120 de 36 Micrones x 200 u.",
                "precio": 1200
            }
        ],
        guantes: [
            {
                "nombre": "Guantes de látex",
                "tipo": "latex",
                "marca": "Mediglove",
                "imagen": "../imgs/productos/guantes/latexsinpolvo.png",
                "descripcion": "Guantes de látex sin Polvo talle S x 100 u.",
                "precio": 3500
            }
        ]
    };
    
    // Normalizar rutas según la página
    Object.keys(productos).forEach(categoria => {
        productos[categoria].forEach(producto => {
            if (producto.imagen) {
                if (window.location.pathname.includes('admin.html')) {
                    producto.imagen = normalizarRutaImagen(producto.imagen, true);
                } else if (window.location.pathname.includes('productos.html')) {
                    producto.imagen = normalizarRutaImagen(producto.imagen, false);
                }
            }
        });
    });
    
    if (window.location.pathname.includes('productos.html')) {
        cargarProductos();
    }
}

// Función para cargar productos iniciales o por filtros
function cargarProductos() {
    console.log('Función cargarProductos() ejecutada');
    console.log('Productos disponibles:', productos);
    
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    const tipo = urlParams.get('tipo');
    const marca = urlParams.get('marca');

    const container = document.getElementById('productos-container');
    if (!container) {
        console.log('Contenedor de productos no encontrado');
        return;
    }
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
        col.innerHTML = `
            <div class="card h-100">
                <img src="${producto.imagen}" class="card-img-top" style="object-fit: scale-down;" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-center">${producto.nombre}</h5>
                    <p class="card-text text-center flex-grow-1">${producto.descripcion}</p>
                    ${producto.precio && producto.precio > 0 ? `<p class="card-text text-center text-success fw-bold">$${formatearPrecioArgentino(producto.precio)}</p>` : ''}
                    <div class="mt-auto text-center">
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" value="1" min="1" id="cantidad-${producto.descripcion.replace(/\s+/g, '-')}">
                            <button class="btn btn-primary boton-agregar" onclick="agregarAlCarrito('${producto.descripcion.replace(/\s+/g, '-')}', parseInt(document.getElementById('cantidad-${producto.descripcion.replace(/\s+/g, '-')}').value))">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>`;
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
    const productoCompleto = Object.values(productos).flat().find(p => p.descripcion.replace(/\s+/g, '-') === descripcion);
    
    if (productoCompleto) {
        agregarAlCarritoFlotante(productoCompleto, cantidad);
    }
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
    actualizarContadorCarritoFlotante();
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
        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image me-3" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.nombre}</h6>
                <p class="mb-0">${item.descripcion}</p>
                <p class="mb-0 text-success fw-bold">Precio: $${formatearPrecioArgentino(precio)}</p>
                <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="actualizarCantidad('${item.descripcion}', -1)" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <span class="cantidad-item">${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="actualizarCantidad('${item.descripcion}', 1)">+</button>
                    <span class="ms-2 text-success fw-bold">Subtotal: $${formatearPrecioArgentino(subtotal)}</span>
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito('${item.descripcion}')">Eliminar</button>
        `;
        cartItems.appendChild(itemElement);
    });
    
    // Agregar total al final
    const totalElement = document.createElement('div');
    totalElement.className = 'text-end mt-3 p-3 bg-light border-top';
    totalElement.innerHTML = `<h5 class="text-success fw-bold">Total: $${formatearPrecioArgentino(total)}</h5>`;
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
    opcionesEnvio.innerHTML = `
        <h5>Seleccione el método de envío:</h5>
        <button id="enviar-correo" class="btn btn-primary me-2">Enviar por correo</button>
        <button id="enviar-whatsapp" class="btn btn-success">Enviar por WhatsApp</button>
    `;

    const modalBody = document.querySelector('.modal-body');
    modalBody.appendChild(opcionesEnvio);

    document.getElementById('enviar-correo').addEventListener('click', enviarPorCorreo);
    document.getElementById('enviar-whatsapp').addEventListener('click', enviarPorWhatsApp);
}

function enviarPorCorreo() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let mensaje = 'Solicitud de cotización:\n\n';
    let total = 0;
    
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += `${item.nombre} - ${item.descripcion} - Cantidad: ${item.cantidad} - Precio: $${formatearPrecioArgentino(precio)} - Subtotal: $${formatearPrecioArgentino(subtotal)}\n`;
    });
    
    mensaje += `\nTotal: $${formatearPrecioArgentino(total)}`;

    const mailtoLink = `mailto:info@ecogroupservice.com.ar?subject=Solicitud de Cotización&body=${encodeURIComponent(mensaje)}`;
    window.location.href = mailtoLink;
}

function enviarPorWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let mensaje = 'Solicitud de cotización:\n\n';
    let total = 0;
    
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += `${item.nombre} - ${item.descripcion} - Cantidad: ${item.cantidad} - Precio: $${formatearPrecioArgentino(precio)} - Subtotal: $${formatearPrecioArgentino(subtotal)}\n`;
    });
    
    mensaje += `\nTotal: $${formatearPrecioArgentino(total)}`;

    const whatsappLink = `https://wa.me/5491136267653?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, '_blank');
}

function limpiarCarrito() {
    localStorage.removeItem('carrito');
    actualizarIconoCarrito();
    mostrarCarrito();
}

// Main logic when loading the page
document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos desde JSON
    cargarProductosDesdeJSON();

    // Verificar que estamos en la página de productos
    const productosContainer = document.getElementById('productos-container');
    if (productosContainer) {
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        // Listen for click on search button
        if (searchButton && searchInput) {
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
        }

        // Initialize cart icon and modal
        actualizarIconoCarrito();
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', mostrarCarrito);
        }

        // Add event listener for sending quote
        const sendQuote = document.getElementById('send-quote');
        if (sendQuote) {
            sendQuote.addEventListener('click', enviarCotizacion);
        }
    }
}); 