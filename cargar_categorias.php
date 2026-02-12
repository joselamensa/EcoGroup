<?php
// cargar_categorias.php - Versión Final SQLite
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->query("SELECT * FROM categorias");
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $categorias = [];
    foreach ($resultados as $row) {
        $clave = $row['clave'];
        
        // Decodificar los tipos. Si falla o es null, devolver array vacío []
        $tiposDecodificados = json_decode($row['tipos']);
        if (!is_array($tiposDecodificados)) {
            $tiposDecodificados = [];
        }
        $row['tipos'] = $tiposDecodificados;
        
        $categorias[$clave] = $row;
    }

    echo json_encode(['success' => true, 'categorias' => $categorias]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>