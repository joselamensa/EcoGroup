<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar que sea una petición GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Ruta del archivo productos.json
$archivo_productos = 'productos.json';

try {
    // Verificar que el archivo existe
    if (!file_exists($archivo_productos)) {
        throw new Exception('Archivo de productos no encontrado');
    }
    
    // Leer el contenido del archivo
    $contenido = file_get_contents($archivo_productos);
    
    if ($contenido === false) {
        throw new Exception('No se pudo leer el archivo de productos');
    }
    
    // Decodificar el JSON
    $productos = json_decode($contenido, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
    }
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'productos' => $productos,
        'timestamp' => date('Y-m-d H:i:s'),
        'ultima_modificacion' => date('Y-m-d H:i:s', filemtime($archivo_productos))
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al cargar productos: ' . $e->getMessage()
    ]);
}
?> 