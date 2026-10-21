<?php

$db_server = "localhost";
$db_port = "3307"; // Docker database port
$db_user = getenv("DB_USER") ?: "mail";
$db_pass = getenv("DB_PASSWORD") ?: "base";
$db_name = getenv("DB_NAME") ?: "mailbase";
$conn = "";

try {
    $conn = mysqli_connect($db_server, $db_user, $db_pass, $db_name, $db_port);

    if ($conn) {
        mysqli_set_charset($conn, "utf8mb4");
        $status_conn = "Database connection successful to $db_name";

        // Create users table if it doesn't exist
        $table_sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        mysqli_query($conn, $table_sql);

        // Create gmail_credentials table if it doesn't exist
        $gmail_sql = "CREATE TABLE IF NOT EXISTS gmail_credentials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            gmail_address VARCHAR(255) NOT NULL,
            app_password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_gmail (user_id, gmail_address)
        )";

        mysqli_query($conn, $gmail_sql);

        // Create emails table if it doesn't exist
        $emails_sql = "CREATE TABLE IF NOT EXISTS emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            gmail_message_id VARCHAR(255) NOT NULL,
            subject VARCHAR(500),
            sender VARCHAR(255),
            sender_email VARCHAR(255),
            body TEXT,
            received_date DATETIME,
            folder VARCHAR(50) DEFAULT 'inbox',
            starred BOOLEAN DEFAULT FALSE,
            important BOOLEAN DEFAULT FALSE,
            archived BOOLEAN DEFAULT FALSE,
            has_attachments BOOLEAN DEFAULT FALSE,
            attachments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_message (user_id, gmail_message_id)
        )";

        mysqli_query($conn, $emails_sql);
    }
} catch (mysqli_sql_exception $e) {
    $status_conn = "Database connection failed: " . $e->getMessage();
}

?> 