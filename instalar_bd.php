<?php
// instalar_bd.php
header('Content-Type: text/html; charset=utf-8');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Crear tabla productos
    $db->exec("CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_clave TEXT,
        nombre TEXT,
        descripcion TEXT,
        precio REAL DEFAULT 0,
        tipo TEXT,
        marca TEXT,
        imagen TEXT,
        destacado INTEGER DEFAULT 0
    )");

    // 2. Migrar datos desde productos.json
    if (file_exists('productos.json')) {
        $json = file_get_contents('productos.json');
        $data = json_decode($json, true);
        
        $stmt = $db->prepare("INSERT INTO productos (categoria_clave, nombre, descripcion, precio, tipo, marca, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $count = 0;
        foreach ($data as $cat => $prods) {
            foreach ($prods as $p) {
                // Validación básica para evitar errores
                $nom = $p['nombre'] ?? 'Sin nombre';
                $desc = $p['descripcion'] ?? '';
                $prec = $p['precio'] ?? 0;
                $tipo = $p['tipo'] ?? '';
                $marca = $p['marca'] ?? '';
                $img = $p['imagen'] ?? ''; // Mantener ruta original (ej: ../imgs/...)

                $stmt->execute([$cat, $nom, $desc, $prec, $tipo, $marca, $img]);
                $count++;
            }
        }
        echo "<h1>¡Éxito!</h1><p>Se migraron $count productos a la base de datos 'ecogroup.db'.</p>";
    } else {
        echo "Error: No encuentro productos.json";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>