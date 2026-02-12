<?php
// cargar_productos.php
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consultar todos los productos
    $stmt = $db->query("SELECT * FROM productos");
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Reconstruir el formato que espera tu JS: { "categoria": [ array_de_productos ] }
    $productos_formateados = [];

    foreach ($resultados as $row) {
        $cat = $row['categoria_clave'];
        
        if (!isset($productos_formateados[$cat])) {
            $productos_formateados[$cat] = [];
        }

        // Limpiamos el array para quitar la clave 'categoria_clave' que es redundante dentro del objeto
        $producto_limpio = $row;
        // Opcional: convertir precio a número si viene como string
        $producto_limpio['precio'] = floatval($row['precio']);
        
        $productos_formateados[$cat][] = $producto_limpio;
    }

    // Enviamos la respuesta exactamente como el frontend la quiere
    // Nota: enviamos 'productos' como clave raíz si tu JS lo espera, o directo el array.
    // Viendo tu cargar_productos.php anterior, devolvía { success: true, productos: {...} }
    echo json_encode([
        'success' => true,
        'productos' => $productos_formateados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>