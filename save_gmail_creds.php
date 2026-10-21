<?php
require_once 'database.php';

if (!$conn) {
    die("Database connectie mislukt: " . $status_conn);
}

$user_id = 1; // test@docker.com user
$gmail_address = "nilshendy1st@gmail.com";
$app_password = "ckqmnrnxoageyetu";

// Check if credentials already exist
$check = "SELECT id FROM gmail_credentials WHERE user_id = $user_id";
$result = mysqli_query($conn, $check);

if (mysqli_num_rows($result) > 0) {
    // Update
    $update = "UPDATE gmail_credentials SET gmail_address = '$gmail_address', app_password = '$app_password' WHERE user_id = $user_id";
    if (mysqli_query($conn, $update)) {
        echo "Gmail credentials bijgewerkt voor user_id $user_id<br>";
    } else {
        echo "Fout bij bijwerken: " . mysqli_error($conn) . "<br>";
    }
} else {
    // Insert
    $insert = "INSERT INTO gmail_credentials (user_id, gmail_address, app_password) VALUES ($user_id, '$gmail_address', '$app_password')";
    if (mysqli_query($conn, $insert)) {
        echo "Gmail credentials opgeslagen voor user_id $user_id<br>";
    } else {
        echo "Fout bij opslaan: " . mysqli_error($conn) . "<br>";
    }
}

mysqli_close($conn);
echo "<a href='front-end.php'>Ga naar front-end</a>";
?>
