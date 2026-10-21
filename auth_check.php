<?php
// Voor API's: alleen ingelogde gebruikers, en altijd met hun eigen user_id uit de sessie
session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Niet ingelogd']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
session_write_close();
?>
