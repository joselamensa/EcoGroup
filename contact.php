<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = htmlspecialchars($_POST['nombre']);
    $email = htmlspecialchars($_POST['email']);
    $mensaje = htmlspecialchars($_POST['mensaje']);

    $to = "info@ecogroupservice.com.ar";  // Cambia esto por tu correo electrónico
    $subject = "Mensaje de contacto de $nombre";
    $body = "Nombre: $nombre\nCorreo electrónico: $email\nMensaje:\n$mensaje";
    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "Mensaje enviado correctamente. Gracias, $nombre.";
    } else {
        echo "Lo siento, hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.";
    }
}
?>
