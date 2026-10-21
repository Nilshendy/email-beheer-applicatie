<?php
header('Content-Type: application/json');
require_once 'auth_check.php';
require_once 'python_runner.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
    exit;
}

set_time_limit(180);

// Haalt nieuwe mails op uit Gmail (IMAP) voor alleen deze gebruiker
echo json_encode(run_python_script('imap_client.py', ['--user', $user_id]));
?>
