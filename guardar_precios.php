<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener el contenido JSON del request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verificar que el JSON sea válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

// Verificar que existan los datos de productos
if (!isset($data['productos']) || !is_array($data['productos'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de productos requeridos']);
    exit;
}

// Ruta del archivo productos.json
$archivo_productos = 'productos.json';

try {
    // Guardar los productos en el archivo JSON
    $resultado = file_put_contents($archivo_productos, json_encode($data['productos'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($resultado === false) {
        throw new Exception('No se pudo escribir en el archivo');
    }
    
    // Generar el archivo productos.js automáticamente
    generarProductosJS($data['productos']);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Productos guardados correctamente',
        'timestamp' => date('Y-m-d H:i:s'),
        'archivo' => $archivo_productos
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al guardar productos: ' . $e->getMessage()
    ]);
}

/**
 * Genera el archivo productos.js a partir del JSON
 */
function generarProductosJS($productos) {
    $contenido = "// Archivo generado automáticamente desde productos.json\n";
    $contenido .= "// Última actualización: " . date('Y-m-d H:i:s') . "\n\n";
    $contenido .= "const productos = " . json_encode($productos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n";
    
    $archivo_js = 'js/productos.js';
    file_put_contents($archivo_js, $contenido);
}
?> 