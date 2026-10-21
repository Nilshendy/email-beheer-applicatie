<?php
header('Content-Type: application/json');
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $gmail_address = mysqli_real_escape_string($conn, $data['gmail_address']);
    $app_password = mysqli_real_escape_string($conn, $data['app_password']);

    if ($user_id === 0) {
        echo json_encode(['success' => false, 'message' => 'Ongeldige user ID']);
        exit;
    }

    // Check if user exists
    $check_user = "SELECT id FROM users WHERE id = $user_id";
    $user_result = mysqli_query($conn, $check_user);

    if (mysqli_num_rows($user_result) === 0) {
        echo json_encode(['success' => false, 'message' => 'Gebruiker niet gevonden']);
        exit;
    }

    // Check if credentials already exist
    $check_credentials = "SELECT id FROM gmail_credentials WHERE user_id = $user_id";
    $cred_result = mysqli_query($conn, $check_credentials);

    if (mysqli_num_rows($cred_result) > 0) {
        // Update existing credentials
        $update_query = "UPDATE gmail_credentials SET gmail_address = '$gmail_address', app_password = '$app_password' WHERE user_id = $user_id";

        if (mysqli_query($conn, $update_query)) {
            echo json_encode(['success' => true, 'message' => 'Gmail credentials bijgewerkt']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Bijwerken mislukt: ' . mysqli_error($conn)]);
        }
    } else {
        // Insert new credentials
        $insert_query = "INSERT INTO gmail_credentials (user_id, gmail_address, app_password) VALUES ($user_id, '$gmail_address', '$app_password')";

        if (mysqli_query($conn, $insert_query)) {
            echo json_encode(['success' => true, 'message' => 'Gmail credentials opgeslagen']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Opslaan mislukt: ' . mysqli_error($conn)]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get Gmail credentials for a user
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
        exit;
    }

    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

    if ($user_id === 0) {
        echo json_encode(['success' => false, 'message' => 'Ongeldige user ID']);
        exit;
    }

    $query = "SELECT gmail_address FROM gmail_credentials WHERE user_id = $user_id";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['success' => true, 'gmail_address' => $row['gmail_address']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Geen Gmail credentials gevonden']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>
