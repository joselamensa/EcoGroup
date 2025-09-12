<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$archivo_categorias = 'categorias.json';
$archivo_productos = 'productos.json';

function leerJson($filepath) {
    if (!file_exists($filepath)) {
        return null;
    }
    $content = file_get_contents($filepath);
    if ($content === false) {
        return null;
    }
    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Error JSON en $filepath: " . json_last_error_msg());
        return null;
    }
    return $data;
}

function escribirJson($filepath, $data) {
    $json_data = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json_data === false) {
        error_log("Error al codificar JSON para $filepath: " . json_last_error_msg());
        return false;
    }
    if (file_put_contents($filepath, $json_data) === false) {
        error_log("Error al escribir en $filepath");
        return false;
    }
    return true;
}

$accion = $_GET['accion'] ?? '';

if ($accion === 'sincronizar') {
    $categorias = leerJson($archivo_categorias);
    $productos_data = leerJson($archivo_productos);

    if ($categorias === null) {
        echo json_encode(['success' => false, 'error' => 'No se pudo leer el archivo de categorías.']);
        exit;
    }
    if ($productos_data === null) {
        echo json_encode(['success' => false, 'error' => 'No se pudo leer el archivo de productos.']);
        exit;
    }

    $tipos_agregados_count = 0;
    $categorias_actualizadas_count = 0;

    foreach ($productos_data as $categoria_clave => $lista_productos) {
        if (!isset($categorias[$categoria_clave])) {
            $nombre_legible = ucfirst(str_replace('_', ' ', $categoria_clave));
            $categorias[$categoria_clave] = [
                'nombre' => $nombre_legible,
                'descripcion' => '',
                'icono' => 'fas fa-box',
                'tipos' => []
            ];
            $categorias_actualizadas_count++;
        }

        if (!isset($categorias[$categoria_clave]['tipos']) || !is_array($categorias[$categoria_clave]['tipos'])) {
            $categorias[$categoria_clave]['tipos'] = [];
            $categorias_actualizadas_count++;
        }

        $tipos_existentes_en_categoria = $categorias[$categoria_clave]['tipos'];
        $nuevos_tipos_en_productos = [];

        foreach ($lista_productos as $producto) {
            if (isset($producto['tipo']) && trim($producto['tipo']) !== '') {
                $tipo = trim($producto['tipo']);
                if (!in_array($tipo, $tipos_existentes_en_categoria) && !in_array($tipo, $nuevos_tipos_en_productos)) {
                    $nuevos_tipos_en_productos[] = $tipo;
                    $tipos_agregados_count++;
                }
            }
        }

        if (!empty($nuevos_tipos_en_productos)) {
            $categorias[$categoria_clave]['tipos'] = array_merge($tipos_existentes_en_categoria, $nuevos_tipos_en_productos);
            sort($categorias[$categoria_clave]['tipos']);
            $categorias_actualizadas_count++;
        }
    }

    if (escribirJson($archivo_categorias, $categorias)) {
        echo json_encode([
            'success' => true,
            'message' => 'Tipos sincronizados exitosamente.',
            'tipos_agregados' => $tipos_agregados_count,
            'categorias_actualizadas' => $categorias_actualizadas_count
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al guardar las categorías actualizadas.']);
    }
} elseif ($accion === 'estadisticas') {
    $categorias = leerJson($archivo_categorias);
    $productos_data = leerJson($archivo_productos);

    if ($categorias === null || $productos_data === null) {
        echo json_encode(['success' => false, 'error' => 'No se pudieron cargar los datos necesarios.']);
        exit;
    }

    $total_categorias = count($categorias);
    $total_tipos = 0;
    $total_productos = 0;
    $categorias_con_tipos = 0;
    $tipos_por_categoria = [];

    foreach ($categorias as $clave => $cat_info) {
        $num_tipos = isset($cat_info['tipos']) && is_array($cat_info['tipos']) ? count($cat_info['tipos']) : 0;
        $total_tipos += $num_tipos;
        if ($num_tipos > 0) {
            $categorias_con_tipos++;
        }

        $num_productos = isset($productos_data[$clave]) ? count($productos_data[$clave]) : 0;
        $total_productos += $num_productos;

        $tipos_por_categoria[$clave] = [
            'nombre' => $cat_info['nombre'] ?? $clave,
            'tipos' => $num_tipos,
            'productos' => $num_productos
        ];
    }

    echo json_encode([
        'success' => true,
        'estadisticas' => [
            'total_categorias' => $total_categorias,
            'total_tipos' => $total_tipos,
            'total_productos' => $total_productos,
            'categorias_con_tipos' => $categorias_con_tipos,
            'tipos_por_categoria' => $tipos_por_categoria
        ]
    ]);

} else {
    echo json_encode(['success' => false, 'error' => 'Acción no válida.']);
}
?>
