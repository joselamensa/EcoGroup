<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$archivo_categorias = 'categorias.json';

if (!file_exists($archivo_categorias)) {
    echo json_encode([
        'success' => true,
        'categorias' => new stdClass()
    ]);
    exit;
}

$contenido = file_get_contents($archivo_categorias);
$data = json_decode($contenido, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo leer categorias.json']);
    exit;
}

// Asegurar que cada categoría tenga 'tipos' como array
foreach ($data as $k => $cat) {
    if (!isset($data[$k]['tipos']) || !is_array($data[$k]['tipos'])) {
        $data[$k]['tipos'] = [];
    }
}

echo json_encode([
    'success' => true,
    'categorias' => $data
]);
?>


