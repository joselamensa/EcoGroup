<?php
// migrar_extra.php
header('Content-Type: text/html; charset=utf-8');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<h2>Iniciando migración de extras...</h2>";

    // --- 1. MIGRAR CATEGORÍAS ---
    if (file_exists('categorias.json')) {
        $json = file_get_contents('categorias.json');
        $categorias = json_decode($json, true);
        
        // Limpiamos la tabla primero para evitar duplicados
        $db->exec("DELETE FROM categorias");
        
        $stmt = $db->prepare("INSERT INTO categorias (clave, nombre, descripcion, icono, tipos) VALUES (?, ?, ?, ?, ?)");
        $count = 0;

        foreach ($categorias as $clave => $cat) {
            // Convertir array de tipos a texto JSON para guardarlo en la base de datos
            $tiposJson = isset($cat['tipos']) ? json_encode($cat['tipos'], JSON_UNESCAPED_UNICODE) : '[]';
            
            $stmt->execute([
                $clave,
                $cat['nombre'] ?? $clave,
                $cat['descripcion'] ?? '',
                $cat['icono'] ?? 'fas fa-box',
                $tiposJson
            ]);
            $count++;
        }
        echo "✅ Categorías migradas: $count<br>";
    } else {
        echo "⚠️ No se encontró categorias.json<br>";
    }

    // --- 2. MIGRAR BANNERS ---
    if (file_exists('banners.json')) {
        $json = file_get_contents('banners.json');
        $banners = json_decode($json, true);
        
        // Limpiamos la tabla primero
        $db->exec("DELETE FROM banners");

        $stmt = $db->prepare("INSERT INTO banners (titulo, descripcion, imagen, tipo, orden, activo, url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $count = 0;

        foreach ($banners as $b) {
            $stmt->execute([
                $b['titulo'] ?? '',
                $b['descripcion'] ?? '',
                $b['imagen'] ?? '',
                $b['tipo'] ?? 'desktop',
                $b['orden'] ?? 1,
                $b['activo'] ? 1 : 0,
                $b['url'] ?? ''
            ]);
            $count++;
        }
        echo "✅ Banners migrados: $count<br>";
    } else {
        echo "⚠️ No se encontró banners.json<br>";
    }

    echo "<h3>🎉 ¡Datos recuperados exitosamente!</h3>";
    echo "<a href='admin.html'>Ir al Panel de Admin</a>";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>