<?php
require_once 'database.php';

if (!$conn) {
    die("Database connectie mislukt: " . $status_conn);
}

echo "<h1>Database Tabellen - $db_name</h1>";
echo "<p><strong>Status:</strong> $status_conn</p>";

// Get all tables
$query = "SHOW TABLES";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    echo "<h2>Tabellen:</h2>";
    echo "<ul>";
    while ($row = mysqli_fetch_row($result)) {
        echo "<li><strong>" . $row[0] . "</strong></li>";
    }
    echo "</ul>";
} else {
    echo "<p>Geen tabellen gevonden.</p>";
}

mysqli_close($conn);
?>
