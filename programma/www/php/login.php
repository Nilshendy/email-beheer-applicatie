<?php
session_start();
$fout = "";

if (isset($_SESSION['login'])) {
    $fout = $_SESSION['login'];
    unset($_SESSION['login']); // melding maar één keer tonen
}
?>


<!DOCTYPE html>
<html lang="nl">
<head>
    <title>Inloggen - mailbase</title>
    <link rel="stylesheet" href="../css/login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <!-- Notification Container -->
        <!-- <div class="notification-container" id="notificationContainer"></div> -->

        <div class="auth-box">
            
            <form class="auth-form" action="loginCM.php" method="post">

                <div class="form-group">

                    <label>E-mail</label><br>
                    <input type="email" id="email" name="email" placeholder="voer uw e-mail in" required>

                </div>

                
                <div class="form-group">

                    <label>Wachtwoord</label><br>
                    <input type="password" id="password" name="password" placeholder="voer uw wachtwoord in" required >

                </div>
                
                <!-- <div class="form-actions">

                    <a href="#" class="forgot-password">Wachtwoord vergeten?</a>
                
                </div> -->

                <button type="submit" class="auth-btn login-btn" name="login">Log in</button>

                <br><br><br>

                <?php
                    if ($fout !== "" && $fout !== true && $fout !== false) {
                        echo htmlspecialchars($fout);
                    }              
                ?>
-


            </form>
        </div>
    </div>
</body>
</html>