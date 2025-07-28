<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar que sea una petición GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Ruta del archivo banners.json
$archivo_banners = 'banners.json';

try {
    // Verificar que el archivo existe
    if (!file_exists($archivo_banners)) {
        // Si no existe, crear banners por defecto
        $banners_por_defecto = [
            [
                'id' => 1,
                'titulo' => 'Banner Principal',
                'descripcion' => 'Banner principal de Eco Group',
                'imagen' => './imgs/banners/banner1png.webp',
                'tipo' => 'desktop',
                'orden' => 1,
                'activo' => true,
                'url' => ''
            ],
            [
                'id' => 2,
                'titulo' => 'Clientes que Confían',
                'descripcion' => 'Banner de confianza de clientes',
                'imagen' => './imgs/banners/confianclientepc2.webp',
                'tipo' => 'desktop',
                'orden' => 2,
                'activo' => true,
                'url' => ''
            ],
            [
                'id' => 3,
                'titulo' => 'Banner Secundario',
                'descripcion' => 'Banner secundario promocional',
                'imagen' => './imgs/banners/Banner2-.webp',
                'tipo' => 'desktop',
                'orden' => 3,
                'activo' => true,
                'url' => ''
            ],
            [
                'id' => 4,
                'titulo' => 'Banner Mobile',
                'descripcion' => 'Banner para dispositivos móviles',
                'imagen' => './imgs/banners/banner1celu.webp',
                'tipo' => 'mobile',
                'orden' => 1,
                'activo' => true,
                'url' => ''
            ]
        ];
        
        file_put_contents($archivo_banners, json_encode($banners_por_defecto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $banners = $banners_por_defecto;
    } else {
        // Leer el contenido del archivo
        $contenido = file_get_contents($archivo_banners);
        
        if ($contenido === false) {
            throw new Exception('No se pudo leer el archivo de banners');
        }
        
        // Decodificar el JSON
        $banners = json_decode($contenido, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
        }
    }
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'banners' => $banners,
        'timestamp' => date('Y-m-d H:i:s'),
        'ultima_modificacion' => file_exists($archivo_banners) ? date('Y-m-d H:i:s', filemtime($archivo_banners)) : date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al cargar banners: ' . $e->getMessage()
    ]);
}
?> 