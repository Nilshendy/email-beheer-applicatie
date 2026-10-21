<?php
require_once 'database.php';

if (!$conn) {
    die("Database connectie mislukt: " . $status_conn);
}

echo "<h1>Database Inhoud - $db_name</h1>";
echo "<p><strong>Status:</strong> $status_conn</p>";

// Get all users
$query = "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC";
$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) > 0) {
    echo "<h2>Geregistreerde Gebruikers:</h2>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr style='background-color: #0030FF; color: white;'>";
    echo "<th>ID</th>";
    echo "<th>Naam</th>";
    echo "<th>Email</th>";
    echo "<th>Aangemaakt</th>";
    echo "</tr>";

    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
        echo "<td>" . htmlspecialchars($row['email']) . "</td>";
        echo "<td>" . $row['created_at'] . "</td>";
        echo "</tr>";
    }

    echo "</table>";
    echo "<p><strong>Totaal:</strong> " . mysqli_num_rows($result) . " gebruiker(s)</p>";
} else {
    echo "<p>Geen gebruikers gevonden in de database.</p>";
}

mysqli_close($conn);
?>