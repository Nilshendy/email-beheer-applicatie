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

    // Check if user exists
    $check_query = "SELECT * FROM users WHERE email = '$email'";
    $check_result = mysqli_query($conn, $check_query);

    if (mysqli_num_rows($check_result) > 0) {
        // User exists, check password
        $query = "SELECT * FROM users WHERE email = '$email' AND password = '$password'";
        $result = mysqli_query($conn, $query);

        if (mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            // Remove password from response for security
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user, 'message' => 'Succesvol ingelogd']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ongeldig wachtwoord']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'E-mailadres niet gevonden. Registreer eerst een account.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>