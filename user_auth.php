<?php
// Gedeelde login-functies voor loginCM.php en api_login.php

function find_user_by_login($conn, $email, $password) {
    $stmt = mysqli_prepare($conn, "SELECT id, name, email, password FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);

    if (!$user) {
        return null;
    }

    $stored = $user['password'];
    $is_legacy_plaintext = password_get_info($stored)['algo'] === null;

    if ($is_legacy_plaintext) {
        // Oude accounts hebben nog een wachtwoord in platte tekst: bij login omzetten naar hash
        if (!hash_equals($stored, $password)) {
            return null;
        }
        update_user_password($conn, $user['id'], $password);
    } elseif (!password_verify($password, $stored)) {
        return null;
    } elseif (password_needs_rehash($stored, PASSWORD_DEFAULT)) {
        update_user_password($conn, $user['id'], $password);
    }

    unset($user['password']);
    return $user;
}

function update_user_password($conn, $user_id, $password) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $hash, $user_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
}

function start_user_session($user) {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    session_regenerate_id(true);
    $_SESSION['login'] = true;
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_email'] = $user['email'];
}
?>
