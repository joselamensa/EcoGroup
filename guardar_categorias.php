<?php
// guardar_categorias.php - Versión SQLite
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['categorias'])) {
    echo json_encode(['error' => 'No hay datos']);
    exit;
}

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->beginTransaction();

    // 1. Limpiar tabla actual (Estrategia simple: borrar y reescribir)
    $db->exec("DELETE FROM categorias");

    // 2. Insertar las nuevas
    $stmt = $db->prepare("INSERT INTO categorias (clave, nombre, descripcion, icono, tipos) VALUES (?, ?, ?, ?, ?)");

    foreach ($input['categorias'] as $clave => $cat) {
        $nombre = $cat['nombre'] ?? '';
        $desc   = $cat['descripcion'] ?? '';
        $icono  = $cat['icono'] ?? '';
        // Convertir el array de tipos a texto para guardarlo
        $tipos  = isset($cat['tipos']) ? json_encode($cat['tipos']) : '[]';

        $stmt->execute([$clave, $nombre, $desc, $icono, $tipos]);
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Categorías guardadas en BD']);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>