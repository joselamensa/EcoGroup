<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$archivo_productos = 'productos.json';

function actualizarTipoEnProductos($categoria, $tipoAnterior, $tipoNuevo) {
    global $archivo_productos;
    
    if (!file_exists($archivo_productos)) {
        return ['success' => false, 'error' => 'Archivo productos.json no encontrado'];
    }
    
    $productos = json_decode(file_get_contents($archivo_productos), true);
    if (!$productos) {
        return ['success' => false, 'error' => 'Error al leer productos.json'];
    }
    
    if (!isset($productos[$categoria])) {
        return ['success' => false, 'error' => "Categoría '{$categoria}' no encontrada"];
    }
    
    $productosActualizados = 0;
    
    foreach ($productos[$categoria] as &$producto) {
        if (isset($producto['tipo']) && $producto['tipo'] === $tipoAnterior) {
            $producto['tipo'] = $tipoNuevo;
            $productosActualizados++;
        }
    }
    
    if (file_put_contents($archivo_productos, json_encode($productos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        return [
            'success' => true,
            'productos_actualizados' => $productosActualizados,
            'categoria' => $categoria,
            'tipo_anterior' => $tipoAnterior,
            'tipo_nuevo' => $tipoNuevo
        ];
    } else {
        return ['success' => false, 'error' => 'Error al guardar productos.json'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos']);
        exit;
    }
    
    $categoria = $input['categoria'] ?? '';
    $tipoAnterior = $input['tipo_anterior'] ?? '';
    $tipoNuevo = $input['tipo_nuevo'] ?? '';
    
    if (empty($categoria) || empty($tipoAnterior) || empty($tipoNuevo)) {
        echo json_encode(['success' => false, 'error' => 'Faltan parámetros requeridos']);
        exit;
    }
    
    if ($tipoAnterior === $tipoNuevo) {
        echo json_encode(['success' => true, 'productos_actualizados' => 0, 'mensaje' => 'No se requieren cambios']);
        exit;
    }
    
    $resultado = actualizarTipoEnProductos($categoria, $tipoAnterior, $tipoNuevo);
    echo json_encode($resultado);
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>
