// Sidebar Dinámica - Carga automática de categorías y tipos
// Este archivo maneja la generación dinámica de la sidebar en productos.html

// Función para obtener todas las categorías únicas
function obtenerCategoriasUnicas() {
    const categorias = new Set();
    
    if (typeof productos !== 'undefined') {
        Object.keys(productos).forEach(categoria => {
            categorias.add(categoria);
        });
    }
    
    return Array.from(categorias).sort();
}

// Función para obtener todos los tipos únicos por categoría
function obtenerTiposPorCategoria(categoria) {
    // Prioridad: tipos definidos en servidor (categorias.json) cacheados en memoria
    if (window.__categoriasCache && window.__categoriasCache[categoria] && Array.isArray(window.__categoriasCache[categoria].tipos) && window.__categoriasCache[categoria].tipos.length > 0) {
        return window.__categoriasCache[categoria].tipos.slice().sort();
    }

    // Fallback: inferir desde productos
    const tipos = new Set();
    if (typeof productos !== 'undefined' && productos[categoria]) {
        productos[categoria].forEach(producto => {
            if (producto.tipo && producto.tipo.trim() !== '') {
                tipos.add(producto.tipo.trim());
            }
        });
    }
    return Array.from(tipos).sort();
}

// Función para obtener todas las marcas únicas por categoría
function obtenerMarcasPorCategoria(categoria) {
    const marcas = new Set();
    
    if (typeof productos !== 'undefined' && productos[categoria]) {
        productos[categoria].forEach(producto => {
            if (producto.marca && producto.marca.trim() !== '') {
                marcas.add(producto.marca.trim());
            }
        });
    }
    
    return Array.from(marcas).sort();
}

// Función para generar el nombre legible de una categoría
function obtenerNombreLegibleCategoria(categoria) {
    const nombresLegibles = {
        'bolsas': 'Bolsas',
        'guantes': 'Guantes',
        'Desinfectantes': 'Aerosoles/Aromatizadores',
        'Resmas': 'Resmas',
        'Papel': 'Papel',
        'Quimicos': 'Químicos',
        'Dispensadores': 'Dispensadores',
        'Segvial': 'Seguridad Vial',
        'Electrodomesticos': 'Electrodomésticos',
        'Indumentaria': 'Indumentaria',
        'Barridoylimpieza': 'Barrido y Limpieza',
        'Herramientas': 'Herramientas'
    };
    
    return nombresLegibles[categoria] || categoria;
}

// Función para generar la sidebar dinámicamente
function generarSidebarDinamica() {
    const sidebarContainer = document.getElementById('sidebar');
    if (!sidebarContainer) {
        console.error('No se encontró el contenedor de la sidebar');
        return;
    }
    
    const categorias = obtenerCategoriasUnicas();
    let sidebarHTML = `
        <div class="sidebar">
            <h4>Categorías</h4>
            <ul class="list-group">
    `;
    
    categorias.forEach(categoria => {
        const nombreLegible = obtenerNombreLegibleCategoria(categoria);
        const tipos = obtenerTiposPorCategoria(categoria);
        const marcas = obtenerMarcasPorCategoria(categoria);
        
        sidebarHTML += `
            <li class="list-group-item" onclick="toggleSubcategories(this)">
                ${nombreLegible}
                <ul class="sub-list" style="display: none;">
                    <a href="./productos.html?categoria=${categoria}">
                        <li class="list-group-item">Todos</li>
                    </a>
        `;
        
        // Agregar tipos únicos
        tipos.forEach(tipo => {
            sidebarHTML += `
                <a href="./productos.html?categoria=${categoria}&tipo=${tipo}">
                    <li class="list-group-item">${tipo}</li>
                </a>
            `;
        });
        
        // Agregar marcas únicas (solo para ciertas categorías)
        if (categoria === 'Desinfectantes' || categoria === 'Quimicos') {
            marcas.forEach(marca => {
                sidebarHTML += `
                    <a href="./productos.html?categoria=${categoria}&marca=${marca}">
                        <li class="list-group-item">${marca}</li>
                    </a>
                `;
            });
        }
        
        sidebarHTML += `
                </ul>
            </li>
        `;
    });
    
    sidebarHTML += `
            </ul>
        </div>
    `;
    
    sidebarContainer.innerHTML = sidebarHTML;
}

// Función para alternar la visibilidad de las subcategorías
function toggleSubcategories(element) {
    const subList = element.querySelector('.sub-list');
    if (subList) {
        const isVisible = subList.style.display !== 'none';
        subList.style.display = isVisible ? 'none' : 'block';
        
        // Agregar clase activa al elemento padre
        if (!isVisible) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }
}

// Función para inicializar la sidebar dinámica
function inicializarSidebarDinamica() {
    // Cargar categorías desde servidor para cachear tipos
    fetch('cargar_categorias.php')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.categorias) {
                window.__categoriasCache = data.categorias;
            }
        })
        .catch(() => {})
        .finally(() => {
            // Esperar a que los productos se carguen
            if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
                generarSidebarDinamica();
            } else {
                // Si los productos no están cargados, esperar un poco más
                setTimeout(() => {
                    if (typeof productos !== 'undefined' && Object.keys(productos).length > 0) {
                        generarSidebarDinamica();
                    } else {
                        console.log('Los productos no se han cargado aún. La sidebar se generará cuando estén disponibles.');
                        // Intentar nuevamente después de un tiempo
                        setTimeout(inicializarSidebarDinamica, 2000);
                    }
                }, 1000);
            }
        });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarSidebarDinamica();
});

// Función para recargar la sidebar (útil para actualizaciones)
function recargarSidebar() {
    generarSidebarDinamica();
}
