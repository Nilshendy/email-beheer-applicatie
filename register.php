<!DOCTYPE html>
<html lang="nl">
<head>
    <title>Registreren - mailbase</title>
    <link rel="stylesheet" href="login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <!-- Notification Container -->
        <div class="notification-container" id="notificationContainer"></div>

        <div class="auth-box">

            <form class="auth-form" action="register" method="post" id="registerForm" autocomplete="off">

                <div class="form-group">

                    <label>E-mail</label><br>
                    <input type="email" id="reg-email" name="email" placeholder="voer uw e-mail in" required autocomplete="email">

                </div>


                <div class="form-group">

                    <label>Wachtwoord</label><br>
                    <input type="password" id="reg-password" name="password" placeholder="voer uw wachtwoord in" required autocomplete="new-password">

                </div>

                <div class="form-group">

                    <label>Bevestig Wachtwoord</label><br>
                    <input type="password" id="reg-confirm-password" name="confirm-password" placeholder="bevestig uw wachtwoord" required autocomplete="new-password">

                </div>

                <button type="submit" class="auth-btn login-btn" name="register">Registreren</button>

                <div style="margin-top: 15px; text-align: center;">
                    <a href="login.php" style="color: #0030FF; text-decoration: none;">Al een account? Inloggen</a>
                </div>

            </form>
        </div>
    </div>

    <script src="auth.js"></script>
</body>
</html>