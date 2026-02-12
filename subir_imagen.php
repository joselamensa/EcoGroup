<?php
// subir_imagen.php - Versión Optimizada (GD Library)
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'Error al subir archivo']);
    exit;
}

$categoria = $_POST['categoria'] ?? 'general';
$archivo = $_FILES['imagen'];

// Directorio destino
$directorioBase = ($categoria === 'banners') ? "imgs/banners/" : "imgs/productos/$categoria/";
if (!is_dir($directorioBase)) {
    mkdir($directorioBase, 0755, true);
}

// Generar nombre único
$nombreBase = uniqid() . '_' . time();
$rutaDestino = $directorioBase . $nombreBase . '.webp'; // Forzamos extensión .webp

// Validar tipo de imagen
$info = getimagesize($archivo['tmp_name']);
if ($info === false) {
    echo json_encode(['error' => 'El archivo no es una imagen válida']);
    exit;
}

$tipo = $info[2]; // 1=GIF, 2=JPEG, 3=PNG, 18=WEBP

// Cargar imagen en memoria según tipo
switch ($tipo) {
    case IMAGETYPE_JPEG:
        $imagen = imagecreatefromjpeg($archivo['tmp_name']);
        break;
    case IMAGETYPE_PNG:
        $imagen = imagecreatefrompng($archivo['tmp_name']);
        // Mantener transparencia PNG
        imagepalettetotruecolor($imagen);
        imagealphablending($imagen, true);
        imagesavealpha($imagen, true);
        break;
    case IMAGETYPE_WEBP:
        $imagen = imagecreatefromwebp($archivo['tmp_name']);
        break;
    case IMAGETYPE_GIF:
        $imagen = imagecreatefromgif($archivo['tmp_name']);
        break;
    default:
        echo json_encode(['error' => 'Formato no soportado (Use JPG, PNG, WEBP)']);
        exit;
}

// --- OPTIMIZACIÓN Y REDIMENSIÓN ---
$ancho = imagesx($imagen);
$alto = imagesy($imagen);
$maxAncho = 1000; // Máximo ancho permitido

if ($ancho > $maxAncho) {
    $nuevoAlto = floor($alto * ($maxAncho / $ancho));
    $nuevaImagen = imagecreatetruecolor($maxAncho, $nuevoAlto);
    
    // Mantener transparencia al redimensionar
    imagealphablending($nuevaImagen, false);
    imagesavealpha($nuevaImagen, true);
    
    imagecopyresampled($nuevaImagen, $imagen, 0, 0, 0, 0, $maxAncho, $nuevoAlto, $ancho, $alto);
    imagedestroy($imagen); // Liberar memoria vieja
    $imagen = $nuevaImagen;
}

// Guardar como WebP (Calidad 80 - Muy buen balance peso/calidad)
if (imagewebp($imagen, $rutaDestino, 80)) {
    imagedestroy($imagen);
    echo json_encode([
        'success' => true,
        'ruta' => $rutaDestino, // Devolvemos la ruta de la nueva imagen optimizada
        'mensaje' => 'Imagen optimizada y guardada'
    ]);
} else {
    echo json_encode(['error' => 'Error al procesar la imagen en el servidor']);
}
?>