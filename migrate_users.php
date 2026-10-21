<?php
require_once 'database.php';

if (!$conn) {
    die("Database connectie mislukt: " . $status_conn);
}

// Make name column nullable
$alter_sql = "ALTER TABLE users MODIFY COLUMN name VARCHAR(255)";

if (mysqli_query($conn, $alter_sql)) {
    echo "✓ Name kolom is nu optioneel (nullable)<br>";
} else {
    echo "✗ Fout bij aanpassen: " . mysqli_error($conn) . "<br>";
}

mysqli_close($conn);
echo "<a href='register.php'>Ga naar registratie</a>";
?>
