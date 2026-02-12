<?php
// guardar_producto_individual.php - Con limpieza de archivos
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

try {
    $db = new PDO('sqlite:ecogroup.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Validar datos
    if (!isset($input['nombre']) || !isset($input['categoria'])) {
        throw new Exception("Datos incompletos");
    }

    // --- LÓGICA DE EDICIÓN ---
    if (isset($input['id']) && is_numeric($input['id'])) {
        $id = $input['id'];
        
        // 1. Obtener la imagen que tiene el producto ACTUALMENTE en la BD
        $stmt = $db->prepare("SELECT imagen FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        $productoActual = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $imagenVieja = $productoActual['imagen'] ?? '';
        $imagenNueva = $input['imagen'];

        // 2. Si la imagen cambió, borrar el archivo viejo
        if ($imagenVieja && $imagenNueva && $imagenVieja !== $imagenNueva) {
            // Limpiar ruta: quitar '../' si existe para que PHP encuentre el archivo
            $rutaArchivoViejo = str_replace('../', '', $imagenVieja);
            
            // Verificar que sea un archivo y que no sea la imagen default
            if (file_exists($rutaArchivoViejo) && !strpos($rutaArchivoViejo, 'default')) {
                unlink($rutaArchivoViejo); // ¡Aquí se borra la basura!
            }
        }

        // 3. Actualizar registro
        $sql = "UPDATE productos SET nombre=?, descripcion=?, precio=?, tipo=?, marca=?, imagen=?, categoria_clave=? WHERE id=?";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $input['nombre'], $input['descripcion'], $input['precio'], 
            $input['tipo'], $input['marca'], $input['imagen'], 
            $input['categoria'], $id
        ]);
        $mensaje = "Producto actualizado (Imagen anterior eliminada).";

    } else {
        // --- LÓGICA DE CREACIÓN ---
        $sql = "INSERT INTO productos (nombre, descripcion, precio, tipo, marca, imagen, categoria_clave) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $input['nombre'], $input['descripcion'], $input['precio'], 
            $input['tipo'], $input['marca'], $input['imagen'], 
            $input['categoria']
        ]);
        $mensaje = "Producto creado correctamente.";
    }

    echo json_encode(['success' => true, 'message' => $mensaje]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>