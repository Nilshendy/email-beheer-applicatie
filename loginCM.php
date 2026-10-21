<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['login'])) {

        include('database.php');

        $email = filter_var(htmlspecialchars(preg_replace('/[^a-zA-Z0-9@.]/', '', $_POST['Email']), FILTER_VALIDATE_EMAIL), FILTER_SANITIZE_EMAIL);

        $password = htmlspecialchars(preg_replace('/[^a-zA-Z0-9 !]/', '', $_POST['Password']));

        // Debug logging
        error_log("Login attempt - Email: " . $email);
        error_log("Login attempt - Password: " . $password);

    // Maakt template
        $sql = "SELECT * FROM users WHERE email = ?";
    // Maakt prepared statement
        $stmt = mysqli_stmt_init($conn);
    // Bereid de prepared statement voor
        if (!mysqli_stmt_prepare($stmt, $sql)) {
            error_log("SQL prepare failed");
        }


        else {
// connect parameters met place holders
            mysqli_stmt_bind_param($stmt, "s", $email);
//Run de prepared statement
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            $row = mysqli_fetch_assoc($result);

            error_log("User found: " . ($row ? "yes" : "no"));


                if (isset($row['email'])) {

                    $email = $row['email'];
                    $pass = $row['password'];

                    error_log("DB password: " . $pass);
                    error_log("Input password: " . $password);
                    error_log("Password match: " . ($password === $pass ? "yes" : "no"));

                    mysqli_close($conn);

                    if ($password === $pass) {

                        $wwstatus = true;

                    } else {

                        $wwstatus = false;
                    }


                    if($wwstatus) {

                        session_start();
                        $_SESSION['login'] = true;
                        $_SESSION['user_email'] = $email;
                        header('Location: front-end.php');
                        exit();
                    }
                    else {

                        $_SESSION["login"] = "Wachtwoord is incorrect";
                        header('Location: login.php');
                        exit();
                    }


            }
            else {

                //error message
                mysqli_close($conn);

                //set session for error
                session_start();
                $_SESSION['login'] = "geen account gevonden";
                header('Location: login.php');
                exit();

            }
        }
    }
}



?>



