// Función local para formatear precio en formato argentino (sin símbolo)
function formatearPrecioARSsinSimbolo(precio) {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

// Función para cargar y mostrar precios de productos destacados
function cargarPreciosProductosDestacados() {
    fetch('./productos.json')
        .then(response => response.json())
        .then(data => {
            // Mapeo de productos destacados con sus identificadores exactos
            const productosDestacados = [
                {
                    nombre: 'Papel Higienico Elegante 300mts', // Nombre exacto del JSON
                    nombreBusqueda: 'Papel higiénico 300mts', // Nombre para mostrar
                    descripcion: 'Papel higiénico suave y resistente, ideal para uso diario. Paquete x 8 u.',
                    imagen: './imgs/productos/Papel/elegante1047.jpg',
                    precio: 0
                },
                {
                    nombre: 'Cera Brillo Intenso Negro', // Nombre exacto del JSON
                    nombreBusqueda: 'Cera Autobrillo Negra', // Nombre para mostrar
                    descripcion: 'Cera Autobrillo Negra de alta calidad para un brillo intenso y duradero.',
                    imagen: './imgs/productos/Qualiquimica/homeproduct.png',
                    precio: 0
                },
                {
                    nombre: 'Bolsas Residuo Negra', // Nombre exacto del JSON
                    nombreBusqueda: 'Bolsa Residuo Negra', // Nombre para mostrar
                    descripcion: 'Bolsas 100 x 120 de 36 Micrones x 200 u.',
                    imagen: './imgs/productos/bolsas/Bolsas de residuos .jpg',
                    precio: 0
                },
                {
                    nombre: 'Rollo de Papel Fiscal Térmico', // Nombre exacto del JSON
                    nombreBusqueda: 'Rollos Fiscales', // Nombre para mostrar
                    descripcion: 'Rollos de Papel Térmico Fiscales 80x80 x 50 u.',
                    imagen: './imgs/productos/rollosfiscales/rollosfiscales.jpg',
                    precio: 0
                }
            ];

            // Buscar precios actualizados en productos.json
            productosDestacados.forEach(producto => {
                // Buscar en todas las categorías
                for (const categoria in data) {
                    if (data[categoria] && Array.isArray(data[categoria])) {
                        const encontrado = data[categoria].find(p => 
                            p.nombre && (
                                p.nombre.toLowerCase() === producto.nombre.toLowerCase() ||
                                p.nombre.toLowerCase().includes(producto.nombre.toLowerCase()) ||
                                producto.nombre.toLowerCase().includes(p.nombre.toLowerCase())
                            )
                        );
                        
                        if (encontrado && encontrado.precio && encontrado.precio > 0) {
                            producto.precio = encontrado.precio;
                            console.log(`Precio encontrado para ${producto.nombre}: $${producto.precio}`);
                            break;
                        }
                    }
                }
                
                // Si no se encontró, mostrar en consola para debug
                if (producto.precio === 0) {
                    console.log(`No se encontró precio para: ${producto.nombre}`);
                }
            });

            // Actualizar el HTML con los precios
            actualizarHTMLProductosDestacados(productosDestacados);
        })
        .catch(error => {
            console.error('Error al cargar los precios:', error);
            // Si hay error, mostrar mensaje de error en lugar de precios por defecto
            const productosDestacados = [
                {
                    nombre: 'Papel Higienico Elegante 300mts',
                    nombreBusqueda: 'Papel higiénico 300mts',
                    descripcion: 'Papel higiénico suave y resistente, ideal para uso diario. Paquete x 8 u.',
                    imagen: './imgs/productos/Papel/elegante1047.jpg',
                    precio: 0
                },
                {
                    nombre: 'Cera Brillo Intenso Negro',
                    nombreBusqueda: 'Cera Autobrillo Negra',
                    descripcion: 'Cera Autobrillo Negra de alta calidad para un brillo intenso y duradero.',
                    imagen: './imgs/productos/Qualiquimica/homeproduct.png',
                    precio: 0
                },
                {
                    nombre: 'Bolsas Residuo Negra',
                    nombreBusqueda: 'Bolsa Residuo Negra',
                    descripcion: 'Bolsas 100 x 120 de 36 Micrones x 200 u.',
                    imagen: './imgs/productos/bolsas/Bolsas de residuos .jpg',
                    precio: 0
                },
                {
                    nombre: 'Rollo de Papel Fiscal Térmico',
                    nombreBusqueda: 'Rollos Fiscales',
                    descripcion: 'Rollos de Papel Térmico Fiscales 80x80 x 50 u.',
                    imagen: './imgs/productos/rollosfiscales/rollosfiscales.jpg',
                    precio: 0
                }
            ];
            actualizarHTMLProductosDestacados(productosDestacados);
        });
}

// Función para actualizar el HTML de productos destacados
function actualizarHTMLProductosDestacados(productos) {
    const cards = document.querySelectorAll('#productosCarousel .carousel-item.active .card');
    
    cards.forEach((card, index) => {
        if (productos[index]) {
            const producto = productos[index];
            
            // Buscar o crear el elemento de precio
            let precioElement = card.querySelector('.producto-precio');
            if (!precioElement) {
                // Crear el elemento de precio si no existe
                const cardBody = card.querySelector('.card-body');
                const titulo = cardBody.querySelector('.card-title');
                
                precioElement = document.createElement('p');
                precioElement.className = 'producto-precio text-center fw-bold text-primary mb-2';
                cardBody.insertBefore(precioElement, titulo.nextSibling);
            }
            
            // Actualizar el precio (un solo símbolo en HTML)
            if (producto.precio > 0) {
                precioElement.textContent = `$ ${formatearPrecioARSsinSimbolo(producto.precio)}`;
                precioElement.className = 'producto-precio text-center fw-bold text-primary mb-2';
                precioElement.style.display = 'block';
            } else {
                precioElement.textContent = 'Precio no disponible';
                precioElement.className = 'producto-precio text-center fw-bold text-muted mb-2';
                precioElement.style.display = 'block';
            }
            
            // Actualizar el botón con el precio correcto
            const boton = card.querySelector('.btn');
            if (boton) {
                boton.onclick = function() {
                    agregarProductoDestacado(
                        producto.nombreBusqueda, // Usar el nombre para mostrar
                        producto.descripcion,
                        producto.precio,
                        producto.imagen
                    );
                };
            }
        }
    });
}

// Función para recargar precios (útil para actualizaciones en tiempo real)
function recargarPreciosDestacados() {
    cargarPreciosProductosDestacados();
}

// Cargar precios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarPreciosProductosDestacados();
});

// Opcional: Recargar precios cada 30 segundos para mantener sincronización
setInterval(function() {
    cargarPreciosProductosDestacados();
}, 30000); // 30 segundos
