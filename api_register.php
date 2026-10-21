<?php
header('Content-Type: application/json');
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = mysqli_real_escape_string($conn, $data['password']);
    $name = $email; // Use email as name since we don't have a name field

    // Check if user already exists
    $check_query = "SELECT id FROM users WHERE email = '$email'";
    $result = mysqli_query($conn, $check_query);

    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => false, 'message' => 'Dit e-mailadres is al geregistreerd']);
        exit;
    }

    // Insert new user
    $insert_query = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$password')";

    if (mysqli_query($conn, $insert_query)) {
        echo json_encode(['success' => true, 'message' => 'Registratie succesvol']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registratie mislukt: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>