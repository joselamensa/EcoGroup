<?php
// guardar_banners.php - Versión SQLite
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['banners'])) {
    echo json_encode(['error' => 'No hay datos']);
    exit;
}

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->beginTransaction();

    // 1. Limpiar tabla actual
    $db->exec("DELETE FROM banners");

    // 2. Insertar nuevos
    $stmt = $db->prepare("INSERT INTO banners (titulo, descripcion, imagen, tipo, orden, activo, url) VALUES (?, ?, ?, ?, ?, ?, ?)");

    foreach ($input['banners'] as $b) {
        $stmt->execute([
            $b['titulo'] ?? '',
            $b['descripcion'] ?? '',
            $b['imagen'] ?? '',
            $b['tipo'] ?? 'desktop',
            $b['orden'] ?? 0,
            $b['activo'] ? 1 : 0, // Convertir true/false a 1/0
            $b['url'] ?? ''
        ]);
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Banners guardados en BD']);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>