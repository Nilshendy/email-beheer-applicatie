<?php
header('Content-Type: application/json');
require_once 'auth_check.php';
require_once 'database.php';

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $gmail_address = trim($data['gmail_address'] ?? '');
    $app_password = str_replace(' ', '', $data['app_password'] ?? '');

    if (!filter_var($gmail_address, FILTER_VALIDATE_EMAIL) || $app_password === '') {
        echo json_encode(['success' => false, 'message' => 'Vul een geldig e-mailadres en App Password in']);
        exit;
    }

    // Eén Gmail-koppeling per gebruiker: bestaande vervangen
    $stmt = mysqli_prepare($conn, "DELETE FROM gmail_credentials WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    $stmt = mysqli_prepare($conn, "INSERT INTO gmail_credentials (user_id, gmail_address, app_password) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "iss", $user_id, $gmail_address, $app_password);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Gmail gegevens opgeslagen']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Opslaan mislukt']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = mysqli_prepare($conn, "SELECT gmail_address FROM gmail_credentials WHERE user_id = ?");
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if ($row) {
        echo json_encode(['success' => true, 'gmail_address' => $row['gmail_address']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Geen Gmail gegevens gevonden']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>
