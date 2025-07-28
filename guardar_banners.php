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

// Obtener el contenido JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

// Verificar que se hayan enviado los banners
if (!isset($data['banners']) || !is_array($data['banners'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se enviaron datos de banners válidos']);
    exit;
}

$banners = $data['banners'];
$archivo_banners = 'banners.json';

try {
    // Crear respaldo del archivo actual si existe
    if (file_exists($archivo_banners)) {
        $backup_name = 'banners_backup_' . date('Y-m-d_H-i-s') . '.json';
        copy($archivo_banners, $backup_name);
    }
    
    // Guardar los nuevos datos de banners
    $contenido_json = json_encode($banners, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($archivo_banners, $contenido_json, LOCK_EX) === false) {
        throw new Exception('No se pudo escribir el archivo de banners');
    }
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Banners guardados correctamente',
        'archivo' => $archivo_banners,
        'total_banners' => count($banners),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al guardar banners: ' . $e->getMessage()
    ]);
}
?> 