<?php
// eliminar_producto.php
header('Content-Type: application/json');

// Recibir el ID
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(['error' => 'No se recibió ID']);
    exit;
}

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Obtener la ruta de la imagen antes de borrar el registro
    $stmt = $db->prepare("SELECT imagen FROM productos WHERE id = ?");
    $stmt->execute([$id]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Borrar la imagen física si existe
    if ($producto && !empty($producto['imagen'])) {
        $rutaImagen = str_replace('../', '', $producto['imagen']); // Limpiar ruta para PHP
        if (file_exists($rutaImagen) && !strpos($rutaImagen, 'default')) {
            unlink($rutaImagen);
        }
    }

    // 3. Borrar de la base de datos
    $stmtDelete = $db->prepare("DELETE FROM productos WHERE id = ?");
    $stmtDelete->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Producto eliminado correctamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>