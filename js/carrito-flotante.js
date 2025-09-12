// Carrito Flotante - Funcionalidad compartida entre páginas
// Este archivo maneja el carrito flotante que se mantiene entre las páginas

// Función para formatear precios argentinos
function formatearPrecioArgentino(precio) {
    return precio.toLocaleString('es-AR');
}

// Función para normalizar rutas de imágenes según la página actual
function normalizarRutaImagen(rutaImagen) {
    // Si la ruta ya es absoluta o comienza con http, la dejamos como está
    if (rutaImagen.startsWith('http') || rutaImagen.startsWith('/')) {
        return rutaImagen;
    }
    
    // Detectar en qué página estamos
    const currentPath = window.location.pathname;
    
    // Si estamos en productos.html (subcarpeta htmls)
    if (currentPath.includes('/htmls/') || currentPath.includes('htmls/')) {
        // Si la ruta comienza con ./, la convertimos a ../
        if (rutaImagen.startsWith('./')) {
            return rutaImagen.replace('./', '../');
        }
        // Si no tiene prefijo, agregamos ../
        if (!rutaImagen.startsWith('../')) {
            return '../' + rutaImagen;
        }
    } else {
        // Si estamos en index.html (carpeta raíz)
        // Si la ruta comienza con ../, la convertimos a ./
        if (rutaImagen.startsWith('../')) {
            return rutaImagen.replace('../', './');
        }
        // Si no tiene prefijo, agregamos ./
        if (!rutaImagen.startsWith('./')) {
            return './' + rutaImagen;
        }
    }
    
    return rutaImagen;
}

// Función para actualizar el contador del carrito flotante
function actualizarContadorCarritoFlotante() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const cartCountElement = document.getElementById('cart-float-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Función para abrir el modal del carrito flotante
function abrirCarritoFlotante() {
    const modal = document.getElementById('cart-float-modal');
    if (modal) {
        modal.style.display = 'block';
        cargarCarritoFlotante();
    }
}

// Función para cerrar el modal del carrito flotante
function cerrarCarritoFlotante() {
    const modal = document.getElementById('cart-float-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para cargar los items del carrito flotante
function cargarCarritoFlotante() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const itemsContainer = document.getElementById('cart-float-items');
    const totalContainer = document.getElementById('cart-float-total');
    
    if (!itemsContainer || !totalContainer) return;
    
    itemsContainer.innerHTML = '';
    
    if (carrito.length === 0) {
        itemsContainer.innerHTML = '<div class="cart-float-empty">El carrito está vacío</div>';
        totalContainer.innerHTML = '';
        return;
    }
    
    let total = 0;
    
    carrito.forEach((item, index) => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        
        const rutaImagenNormalizada = normalizarRutaImagen(item.imagen);
        const rutaImagenDefault = normalizarRutaImagen('./imgs/productos/default.jpg');
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-float-item';
        itemElement.innerHTML = `
            <img src="${rutaImagenNormalizada}" alt="${item.nombre}" onerror="this.src='${rutaImagenDefault}'">
            <div class="cart-float-item-info">
                <div class="cart-float-item-name">${item.nombre}</div>
                <div class="cart-float-item-desc">${item.descripcion}</div>
                <div class="cart-float-item-price">$${formatearPrecioArgentino(precio)}</div>
            </div>
            <div class="cart-float-item-controls">
                <div class="cart-float-quantity">
                    <button onclick="cambiarCantidadFlotante(${index}, -1)" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidadFlotante(${index}, 1)">+</button>
                </div>
                <button class="cart-float-remove" onclick="eliminarItemFlotante(${index})">Eliminar</button>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
    });
    
    totalContainer.innerHTML = `Total: $${formatearPrecioArgentino(total)}`;
}

// Función para cambiar la cantidad de un item en el carrito flotante
function cambiarCantidadFlotante(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (index >= 0 && index < carrito.length) {
        carrito[index].cantidad += cambio;
        
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarritoFlotante();
        cargarCarritoFlotante();
    }
}

// Función para eliminar un item del carrito flotante
function eliminarItemFlotante(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (index >= 0 && index < carrito.length) {
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarritoFlotante();
        cargarCarritoFlotante();
    }
}

// Función para limpiar el carrito flotante
function limpiarCarritoFlotante() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        actualizarContadorCarritoFlotante();
        cargarCarritoFlotante();
    }
}

// Función para enviar cotización desde el carrito flotante
function enviarCotizacionFlotante() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agregue productos antes de enviar la cotización.');
        return;
    }
    
    let mensaje = 'Solicitud de cotización:\n\n';
    let total = 0;
    
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const subtotal = precio * item.cantidad;
        total += subtotal;
        mensaje += `${item.nombre} - ${item.descripcion} - Cantidad: ${item.cantidad} - Precio: $${formatearPrecioArgentino(precio)} - Subtotal: $${formatearPrecioArgentino(subtotal)}\n`;
    });
    
    mensaje += `\nTotal: $${formatearPrecioArgentino(total)}`;
    
    // Crear opciones de envío
    const opcionesEnvio = `
        <h5>Seleccione el método de envío:</h5>
        <button onclick="enviarPorCorreoFlotante()" style="background: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer;">Enviar por correo</button>
        <button onclick="enviarPorWhatsAppFlotante()" style="background: #25d366; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer;">Enviar por WhatsApp</button>
    `;
    
    const itemsContainer = document.getElementById('cart-float-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = opcionesEnvio;
    }
}

// Función para enviar cotización por correo desde el carrito flotante
function enviarPorCorreoFlotante() {
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

    const mailtoLink = `mailto:ecogroupservice@gmail.com?subject=Solicitud de Cotización&body=${encodeURIComponent(mensaje)}`;
    window.location.href = mailtoLink;
    cerrarCarritoFlotante();
}

// Función para enviar cotización por WhatsApp desde el carrito flotante
function enviarPorWhatsAppFlotante() {
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
    cerrarCarritoFlotante();
}

// Función para agregar producto al carrito desde cualquier página
function agregarAlCarritoFlotante(producto, cantidad = 1) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Buscar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => 
        item.nombre === producto.nombre && 
        item.descripcion === producto.descripcion
    );
    
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarritoFlotante();
    
    // Mostrar mensaje de confirmación
    mostrarMensajeAgregadoFlotante();
}

// Función para agregar productos destacados desde la página principal
function agregarProductoDestacado(nombre, descripcion, precio, imagen) {
    const producto = {
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        imagen: imagen
    };
    
    agregarAlCarritoFlotante(producto, 1);
}

// Función para actualizar cantidad de productos en el carrito
function actualizarCantidad(descripcion, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.descripcion === descripcion);
    
    if (index !== -1) {
        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarritoFlotante();
        cargarCarritoFlotante(); // Actualizar la vista del carrito
    }
}

// Función para eliminar producto del carrito
function eliminarDelCarrito(descripcion) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.descripcion !== descripcion);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarritoFlotante();
    cargarCarritoFlotante(); // Actualizar la vista del carrito
}

// Función para mostrar mensaje de "Agregado al carrito"
function mostrarMensajeAgregadoFlotante() {
    // Crear elemento de mensaje
    const mensaje = document.createElement('div');
    mensaje.textContent = '✓ Agregado al carrito';
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(mensaje);
    
    // Remover el mensaje después de 2 segundos
    setTimeout(() => {
        mensaje.remove();
        style.remove();
    }, 2000);
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('cart-float-modal');
    if (event.target === modal) {
        cerrarCarritoFlotante();
    }
}

// Inicializar el carrito flotante cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarContadorCarritoFlotante();
    
    // Escuchar cambios en el localStorage para sincronizar entre pestañas
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            actualizarContadorCarritoFlotante();
            // Si el modal está abierto, actualizar su contenido
            const modal = document.getElementById('cart-float-modal');
            if (modal && modal.style.display === 'block') {
                cargarCarritoFlotante();
            }
        }
    });
});
