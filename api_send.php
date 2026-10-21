<?php
header('Content-Type: application/json');
require_once 'auth_check.php';
require_once 'database.php';
require_once 'python_runner.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
    exit;
}

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$to = trim($data['to'] ?? '');
$subject = $data['subject'] ?? '';
$message = $data['message'] ?? '';

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Ongeldig e-mailadres van ontvanger']);
    exit;
}

$stmt = mysqli_prepare($conn, "SELECT gmail_address, app_password FROM gmail_credentials WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$credentials = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
mysqli_stmt_close($stmt);

if (!$credentials) {
    echo json_encode(['success' => false, 'message' => 'Koppel eerst je Gmail bij Instellingen']);
    exit;
}

// Wachtwoord via stdin meegeven, zodat het niet in de proceslijst staat
$result = run_python_script('send_cli.py', [], json_encode([
    'sender' => $credentials['gmail_address'],
    'password' => $credentials['app_password'],
    'to' => $to,
    'subject' => $subject,
    'message' => $message,
]));

if (!empty($result['success'])) {
    // Meteen in Verzonden zetten; zelfde Message-ID als in Gmail, dus geen dubbele bij sync
    $stmt = mysqli_prepare($conn, "INSERT IGNORE INTO emails
        (user_id, gmail_message_id, subject, sender, sender_email, body, received_date, folder)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), 'sent')");
    mysqli_stmt_bind_param($stmt, "isssss", $user_id, $result['message_id'], $subject,
        $credentials['gmail_address'], $credentials['gmail_address'], $message);
    mysqli_stmt_execute($stmt);
}

echo json_encode($result);
?>
