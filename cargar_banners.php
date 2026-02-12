<?php
// cargar_banners.php - Versión SQLite
header('Content-Type: application/json');
try {
    $db = new PDO('sqlite:ecogroup.db');
    // Ordenar por orden
    $stmt = $db->query("SELECT * FROM banners ORDER BY orden ASC");
    $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir 1/0 a true/false para JS
    foreach($banners as &$b) {
        $b['activo'] = (bool)$b['activo'];
    }

    echo json_encode(['success' => true, 'banners' => $banners]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>