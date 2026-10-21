<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {

    include('database.php');
    require_once('user_auth.php');

    $email = trim($_POST['Email'] ?? '');
    $password = $_POST['Password'] ?? '';

    if (!$conn) {
        $_SESSION['login_error'] = "Database connectie mislukt";
        header('Location: login.php');
        exit();
    }

    $user = filter_var($email, FILTER_VALIDATE_EMAIL) ? find_user_by_login($conn, $email, $password) : null;
    mysqli_close($conn);

    if ($user) {
        start_user_session($user);
        header('Location: front-end.php');
        exit();
    }

    $_SESSION['login_error'] = "E-mail of wachtwoord is onjuist";
    header('Location: login.php');
    exit();
}

header('Location: login.php');
exit();
?>
