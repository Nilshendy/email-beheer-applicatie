<?php
header('Content-Type: application/json');
require_once 'auth_check.php';
require_once 'database.php';

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Alleen de mails van de ingelogde gebruiker
    $stmt = mysqli_prepare($conn, "SELECT id, gmail_message_id, subject, sender, sender_email, body,
                                          received_date, folder, starred, important, archived,
                                          has_attachments, attachments
                                   FROM emails
                                   WHERE user_id = ? AND deleted = FALSE
                                   ORDER BY received_date DESC");
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $emails = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $emails[] = [
            'id' => (int)$row['id'],
            'gmail_message_id' => $row['gmail_message_id'],
            'subject' => $row['subject'],
            'from' => $row['sender'],
            'from_email' => $row['sender_email'],
            'content' => $row['body'],
            'received_date' => $row['received_date'],
            'starred' => (bool)$row['starred'],
            'important' => (bool)$row['important'],
            'archived' => (bool)$row['archived'],
            'hasAttachments' => (bool)$row['has_attachments'],
            'attachments' => $row['has_attachments'] ? explode(',', $row['attachments']) : [],
            'folder' => $row['folder']
        ];
    }

    echo json_encode(['success' => true, 'emails' => $emails]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Status van een mail aanpassen (ster, archief, verwijderen)
    $data = json_decode(file_get_contents('php://input'), true);

    $email_id = isset($data['email_id']) ? intval($data['email_id']) : 0;
    $action = $data['action'] ?? '';

    $queries = [
        'star' => "UPDATE emails SET starred = NOT starred WHERE id = ? AND user_id = ?",
        'important' => "UPDATE emails SET important = NOT important WHERE id = ? AND user_id = ?",
        // folder eerst, want MySQL gebruikt in de rest van SET al de nieuwe waarde van archived
        'archive' => "UPDATE emails SET folder = IF(archived, 'inbox', 'archived'), archived = NOT archived WHERE id = ? AND user_id = ?",
        // niet echt verwijderen, anders komt de mail bij de volgende sync terug
        'delete' => "UPDATE emails SET deleted = TRUE WHERE id = ? AND user_id = ?",
    ];

    if ($email_id === 0 || !isset($queries[$action])) {
        echo json_encode(['success' => false, 'message' => 'Ongeldige parameters']);
        exit;
    }

    $stmt = mysqli_prepare($conn, $queries[$action]);
    mysqli_stmt_bind_param($stmt, "ii", $email_id, $user_id);
    mysqli_stmt_execute($stmt);

    if (mysqli_stmt_affected_rows($stmt) > 0) {
        echo json_encode(['success' => true, 'message' => 'Email bijgewerkt']);
    } else {
        echo json_encode(['success' => false, 'message' => 'E-mail niet gevonden']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>
