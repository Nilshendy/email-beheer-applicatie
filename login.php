<?php
session_start();
$login_error = $_SESSION['login_error'] ?? '';
unset($_SESSION['login_error']);
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <title>Inloggen - mailbase</title>
    <link rel="stylesheet" href="login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <!-- Notification Container -->
        <!-- <div class="notification-container" id="notificationContainer"></div> -->

        <div class="auth-box">
            
            <form class="auth-form" action="loginCM.php" method="post">

                <?php if ($login_error): ?>
                    <p class="login-error" style="color: #d93025; margin-bottom: 15px;"><?= htmlspecialchars($login_error) ?></p>
                <?php endif; ?>

                <div class="form-group">

                    <label>E-mail</label><br>
                    <input type="email" id="email" name="Email" placeholder="voer uw e-mail in" required>

                </div>

                
                <div class="form-group">

                    <label>Wachtwoord</label><br>
                    <input type="password" id="password" name="Password" placeholder="voer uw wachtwoord in" required >

                </div>
                
                <!-- <div class="form-actions">

                    <a href="#" class="forgot-password">Wachtwoord vergeten?</a>
                
                </div> -->

                <button type="submit" class="auth-btn login-btn" name="login">Log in</button>

                <div style="margin-top: 15px; text-align: center;">
                    <a href="register.php" style="color: #0030FF; text-decoration: none;">Nog geen account? Registreren</a>
                </div>

            </form>
        </div>
    </div>
</body>
</html>