const productos = {
    bolsas: [
    {
        "nombre": "Bolsas de residuos",
        "categoria": "Bolsas",
        "tipo": "residuos",
        "imagen": "../../imgs/productos/bolsas/Bolsas de residuos .jpg",
        "descripcion": "Bolsas diseñadas para la recolección de residuos."
    },
    {
        "nombre": "Bolsa de residuos azul",
        "categoria": "Bolsas",
        "tipo": "residuos",
        "imagen": "../../imgs/productos/bolsas/bolsa residuos azul.jpg",
        "descripcion": "Bolsas de residuos de color azul para una gestión eficiente."
    },
    {
        "nombre": "Bolsa transparente",
        "categoria": "Bolsas",
        "tipo": "transparente",
        "imagen": "../../imgs/productos/bolsas/bolsa transparente.jpg",
        "descripcion": "Bolsas transparentes ideales para la visibilidad de su contenido."
    },
    {
        "nombre": "Bolsas de basura Eco",
        "categoria": "Bolsas",
        "tipo": "ecobolsa",
        "imagen": "../../imgs/productos/bolsas/BolsaResiduoVerde.jpg",
        "descripcion": "Bolsas de basura biodegradables para un entorno más limpio."
    },
    {
        "nombre": "Bolsas amarillas",
        "categoria": "Bolsas",
        "tipo": "amarillas",
        "imagen": "../../imgs/productos/bolsas/bolsas amarillas.jpg",
        "descripcion": "Bolsas amarillas para residuos específicos."
    },
    {
        "nombre": "Bolsas conjunto",
        "categoria": "Bolsas",
        "tipo": "conjunto",
        "imagen": "../../imgs/productos/bolsas/bolsas conjunto.avif",
        "descripcion": "Conjunto de bolsas para diferentes usos."
    },
    ],
    guantes: [
        {
            "nombre": "Guantes de látex",
            "categoria": "Guantes",
            "tipo": "latex",
            "imagen": "../../imgs/productos/guantes/MedigloveNegroReforzado.jpg",
            "descripcion": "Guantes de látex para protección."
        },
        // ... otros productos de guantes
    ]
};

// Función para cargar productos según la categoría y tipo
function cargarProductos() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    const tipo = urlParams.get('tipo');

    const container = document.getElementById('productos-container');
    container.innerHTML = ''; // Limpiar el contenedor

    // Filtrar productos según la categoría
    let productosFiltrados = productos[categoria] || [];
    
    // Si hay un tipo, filtrar aún más
    if (tipo) {
        productosFiltrados = productosFiltrados.filter(producto => producto.tipo === tipo);
    }

    // Mostrar los productos filtrados
    if (productosFiltrados.length === 0) {
        container.innerHTML = '<p>No se encontraron productos.</p>'; // Mensaje si no hay productos
    } else {
        productosFiltrados.forEach(producto => {
            const card = `
                <div class="col-md-4 d-flex justify-content-center">
                    <div class="card mb-4" style="max-width: 18rem;">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body">
                            <h5 class="card-title text-center">${producto.nombre}</h5>
                            <p class="card-text text-center">${producto.descripcion}</p>
                            <div class="d-flex justify-content-center">
                                <a href="#" class="btn btn-primary" onclick="verProducto('${producto.nombre}')">Ver más</a>
                            </div>
                        </div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    }
}

// Llama a la función para cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', () => cargarProductos());
