<?php
// sincronizar_tipos.php - Versión SQLite
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $accion = $_GET['accion'] ?? '';

    if ($accion === 'sincronizar') {
        // 1. Obtener todas las categorías
        $stmtCat = $db->query("SELECT * FROM categorias");
        $categorias = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

        $tiposAgregadosTotal = 0;
        $categoriasActualizadas = 0;

        foreach ($categorias as $cat) {
            $claveCat = $cat['clave'];
            
            // Decodificar tipos actuales
            $tiposActuales = json_decode($cat['tipos'], true);
            if (!is_array($tiposActuales)) $tiposActuales = [];
            
            // 2. Buscar todos los tipos DISTINTOS usados en productos de esta categoría
            $stmtProd = $db->prepare("SELECT DISTINCT tipo FROM productos WHERE categoria_clave = ? AND tipo IS NOT NULL AND tipo != ''");
            $stmtProd->execute([$claveCat]);
            $tiposEnUso = $stmtProd->fetchAll(PDO::FETCH_COLUMN);

            $huboCambios = false;
            
            foreach ($tiposEnUso as $tipoNuevo) {
                $tipoNuevo = trim($tipoNuevo);
                // Si el tipo no está en la lista de la categoría, agregarlo
                if (!in_array($tipoNuevo, $tiposActuales)) {
                    $tiposActuales[] = $tipoNuevo;
                    $tiposAgregadosTotal++;
                    $huboCambios = true;
                }
            }

            // 3. Si hubo cambios, guardar en la base de datos
            if ($huboCambios) {
                sort($tiposActuales); // Ordenar alfabéticamente
                $nuevoJson = json_encode($tiposActuales, JSON_UNESCAPED_UNICODE);
                
                $update = $db->prepare("UPDATE categorias SET tipos = ? WHERE id = ?");
                $update->execute([$nuevoJson, $cat['id']]);
                $categoriasActualizadas++;
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Sincronización completada',
            'tipos_agregados' => $tiposAgregadosTotal,
            'categorias_actualizadas' => $categoriasActualizadas
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Acción no válida']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>