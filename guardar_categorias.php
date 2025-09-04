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

// Verificar que existan los datos de categorías
if (!isset($data['categorias']) || !is_array($data['categorias'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de categorías requeridos']);
    exit;
}

$archivo_categorias = 'categorias.json';

try {
    // Asegurar estructura: cada categoría debe tener arreglo 'tipos'
    foreach ($data['categorias'] as $k => $cat) {
        if (!isset($data['categorias'][$k]['tipos']) || !is_array($data['categorias'][$k]['tipos'])) {
            $data['categorias'][$k]['tipos'] = [];
        }
    }

    $resultado = file_put_contents($archivo_categorias, json_encode($data['categorias'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    if ($resultado === false) {
        throw new Exception('No se pudo escribir en el archivo');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Categorías guardadas correctamente',
        'archivo' => $archivo_categorias,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al guardar categorías: ' . $e->getMessage()
    ]);
}
?>


