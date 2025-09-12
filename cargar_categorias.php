<?php
// Habilitar visualización de errores para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log para debug
error_log("cargar_categorias.php ejecutado - Method: " . $_SERVER['REQUEST_METHOD']);

$archivo_categorias = 'categorias.json';

// Debug: verificar si el archivo existe
if (!file_exists($archivo_categorias)) {
    error_log("Archivo categorias.json no existe, creando categorías por defecto");
    
    // Crear categorías por defecto
    $categorias_defecto = [
        'bolsas' => [
            'nombre' => 'Bolsas',
            'descripcion' => 'Bolsas de residuos y basura',
            'icono' => 'fas fa-trash',
            'tipos' => []
        ],
        'guantes' => [
            'nombre' => 'Guantes',
            'descripcion' => 'Guantes de protección',
            'icono' => 'fas fa-hand-paper',
            'tipos' => []
        ],
        'Desinfectantes' => [
            'nombre' => 'Desinfectantes',
            'descripcion' => 'Productos desinfectantes',
            'icono' => 'fas fa-spray-can',
            'tipos' => []
        ],
        'Resmas' => [
            'nombre' => 'Resmas',
            'descripcion' => 'Papel para impresión',
            'icono' => 'fas fa-file-alt',
            'tipos' => []
        ],
        'Papel' => [
            'nombre' => 'Papel',
            'descripcion' => 'Productos de papel',
            'icono' => 'fas fa-toilet-paper',
            'tipos' => []
        ],
        'Quimicos' => [
            'nombre' => 'Químicos',
            'descripcion' => 'Productos químicos de limpieza',
            'icono' => 'fas fa-flask',
            'tipos' => []
        ],
        'Dispensadores' => [
            'nombre' => 'Dispensadores',
            'descripcion' => 'Dispensadores y contenedores',
            'icono' => 'fas fa-pump-soap',
            'tipos' => []
        ],
        'Segvial' => [
            'nombre' => 'Seguridad Vial',
            'descripcion' => 'Productos de seguridad vial',
            'icono' => 'fas fa-road',
            'tipos' => []
        ],
        'Electrodomesticos' => [
            'nombre' => 'Electrodomésticos',
            'descripcion' => 'Electrodomésticos',
            'icono' => 'fas fa-plug',
            'tipos' => []
        ],
        'Indumentaria' => [
            'nombre' => 'Indumentaria',
            'descripcion' => 'Ropa y calzado de trabajo',
            'icono' => 'fas fa-tshirt',
            'tipos' => []
        ],
        'Barridoylimpieza' => [
            'nombre' => 'Barrido y Limpieza',
            'descripcion' => 'Productos para limpieza',
            'icono' => 'fas fa-broom',
            'tipos' => []
        ],
        'Herramientas' => [
            'nombre' => 'Herramientas',
            'descripcion' => 'Herramientas y equipos',
            'icono' => 'fas fa-tools',
            'tipos' => []
        ]
    ];
    
    // Crear el archivo
    if (file_put_contents($archivo_categorias, json_encode($categorias_defecto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        error_log("Archivo categorias.json creado exitosamente");
    } else {
        error_log("Error al crear categorias.json");
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el archivo categorias.json']);
        exit;
    }
}

// Leer el archivo
$contenido = file_get_contents($archivo_categorias);
if ($contenido === false) {
    error_log("Error al leer categorias.json");
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo leer categorias.json']);
    exit;
}

$data = json_decode($contenido, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Error JSON en categorias.json: " . json_last_error_msg());
    http_response_code(500);
    echo json_encode(['error' => 'Error JSON: ' . json_last_error_msg()]);
    exit;
}

// Asegurar que cada categoría tenga 'tipos' como array
foreach ($data as $k => $cat) {
    if (!isset($data[$k]['tipos']) || !is_array($data[$k]['tipos'])) {
        $data[$k]['tipos'] = [];
    }
}

// Log exitoso
error_log("Categorías cargadas exitosamente. Total: " . count($data));

echo json_encode([
    'success' => true,
    'categorias' => $data,
    'debug' => [
        'archivo_existe' => file_exists($archivo_categorias),
        'total_categorias' => count($data),
        'metodo' => $_SERVER['REQUEST_METHOD']
    ]
]);
?>