<?php
header('Content-Type: application/json');
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
        exit;
    }

    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $folder = isset($_GET['folder']) ? mysqli_real_escape_string($conn, $_GET['folder']) : 'inbox';
    $filter = isset($_GET['filter']) ? mysqli_real_escape_string($conn, $_GET['filter']) : 'all';

    if ($user_id === 0) {
        echo json_encode(['success' => false, 'message' => 'Ongeldige user ID']);
        exit;
    }

    // Build query
    $query = "SELECT id, gmail_message_id, subject, sender, sender_email, body,
                     received_date, folder, starred, important, archived,
                     has_attachments, attachments
              FROM emails
              WHERE user_id = $user_id";

    // Apply folder filter
    $query .= " AND folder = '$folder'";

    // Apply category filter
    if ($filter === 'important') {
        $query .= " AND important = TRUE";
    } elseif ($filter === 'starred') {
        $query .= " AND starred = TRUE";
    } elseif ($filter === 'archived') {
        $query .= " AND archived = TRUE";
    }

    // Order by received date (newest first)
    $query .= " ORDER BY received_date DESC";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Query mislukt: ' . mysqli_error($conn)]);
        exit;
    }

    $emails = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $emails[] = [
            'id' => $row['id'],
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
    // Update email status (star, archive, etc.)
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connectie mislukt']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $email_id = isset($data['email_id']) ? intval($data['email_id']) : 0;
    $action = isset($data['action']) ? $data['action'] : '';

    if ($email_id === 0 || empty($action)) {
        echo json_encode(['success' => false, 'message' => 'Ongeldige parameters']);
        exit;
    }

    switch ($action) {
        case 'star':
            $query = "UPDATE emails SET starred = NOT starred WHERE id = $email_id";
            break;
        case 'important':
            $query = "UPDATE emails SET important = NOT important WHERE id = $email_id";
            break;
        case 'archive':
            $query = "UPDATE emails SET archived = NOT archived, folder = IF(archived = FALSE, 'archived', 'inbox') WHERE id = $email_id";
            break;
        case 'delete':
            $query = "DELETE FROM emails WHERE id = $email_id";
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Ongeldige actie']);
            exit;
    }

    if (mysqli_query($conn, $query)) {
        echo json_encode(['success' => true, 'message' => 'Email bijgewerkt']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Bijwerken mislukt: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ongeldige request methode']);
}
?>
