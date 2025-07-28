<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar que se haya subido un archivo
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No se subió ninguna imagen o hubo un error']);
    exit;
}

// Obtener la categoría
$categoria = $_POST['categoria'] ?? 'general';

// Configuración de la subida
$archivo = $_FILES['imagen'];
$extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$tamañoMaximo = 5 * 1024 * 1024; // 5MB

// Verificar el tipo de archivo
$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
if (!in_array($extension, $extensionesPermitidas)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se permiten: ' . implode(', ', $extensionesPermitidas)]);
    exit;
}

// Verificar el tamaño
if ($archivo['size'] > $tamañoMaximo) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo es demasiado grande. Máximo 5MB']);
    exit;
}

// Crear directorio de destino si no existe
if ($categoria === 'banners') {
    $directorioDestino = "imgs/banners/";
} else {
    $directorioDestino = "imgs/productos/$categoria/";
}
if (!is_dir($directorioDestino)) {
    mkdir($directorioDestino, 0755, true);
}

// Usar nombre fijo si se pasa por POST, si no, generar uno único
if (isset($_POST['nombre_archivo']) && preg_match('/^[a-zA-Z0-9._-]+$/', $_POST['nombre_archivo'])) {
    $nombreArchivo = $_POST['nombre_archivo'];
    $rutaCompleta = $directorioDestino . $nombreArchivo;
    
    // Si el archivo ya existe, eliminarlo primero para asegurar la sobrescritura
    if (file_exists($rutaCompleta)) {
        unlink($rutaCompleta);
    }
} else {
    $nombreArchivo = uniqid() . '_' . time() . '.' . $extension;
    $rutaCompleta = $directorioDestino . $nombreArchivo;
}

// Mover el archivo subido
if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Imagen subida correctamente',
        'ruta' => $rutaCompleta,
        'nombre' => $nombreArchivo
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al mover el archivo subido']);
}
?> 