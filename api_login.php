<?php
header('Content-Type: application/json');
require_once 'database.php';
require_once 'user_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
    exit;
}

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

$user = find_user_by_login($conn, $email, $password);

if ($user) {
    start_user_session($user);
    echo json_encode(['success' => true, 'user' => $user, 'message' => 'Succesvol ingelogd']);
} else {
    echo json_encode(['success' => false, 'message' => 'E-mail of wachtwoord is onjuist']);
}
?>
