<?php
require_once 'database.php';

if (!$conn) {
    die("Database connectie mislukt: " . $status_conn);
}

$email = "test@docker.com";
$new_password = "docker test";

// Update password
$update_query = "UPDATE users SET password = '$new_password' WHERE email = '$email'";

if (mysqli_query($conn, $update_query)) {
    echo "Wachtwoord succesvol bijgewerkt voor $email<br>";
    echo "Nieuw wachtwoord: $new_password<br>";
    echo "<a href='login.php'>Ga naar login pagina</a>";
} else {
    echo "Fout bij bijwerken: " . mysqli_error($conn);
}

mysqli_close($conn);
?>
