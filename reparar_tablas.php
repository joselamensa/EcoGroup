<?php
// reparar_tablas.php
header('Content-Type: text/html; charset=utf-8');

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h3>🛠️ Reparando base de datos...</h3>";

    // 1. Crear tabla CATEGORIAS
    $db->exec("CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT UNIQUE,
        nombre TEXT,
        descripcion TEXT,
        icono TEXT,
        tipos TEXT
    )");
    echo "✅ Tabla 'categorias' verificada/creada.<br>";

    // 2. Crear tabla BANNERS
    $db->exec("CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descripcion TEXT,
        imagen TEXT,
        tipo TEXT,
        orden INTEGER,
        activo INTEGER,
        url TEXT
    )");
    echo "✅ Tabla 'banners' verificada/creada.<br>";

    echo "<h3>🎉 ¡Reparación completada!</h3>";
    echo "Ahora sí, por favor vuelve a ejecutar <strong>migrar_extra.php</strong>";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>