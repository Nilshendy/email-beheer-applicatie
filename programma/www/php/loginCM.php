<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['login'])) {

        session_start();
        
        include('../database_conn/database.php');

        $email = filter_var(htmlspecialchars(preg_replace('/[^a-zA-Z0-9@.]/', '', $_POST['email']), FILTER_VALIDATE_EMAIL), FILTER_SANITIZE_EMAIL);

        $password = htmlspecialchars(preg_replace('/[^a-zA-Z0-9 !]/', '', $_POST['password']));

    // Maakt template 
        $sql = "SELECT * FROM users WHERE email = ?";
    // Maakt prepared statement
        $stmt = mysqli_stmt_init($conn);
    // Bereid de prepared statement voor
        if (!mysqli_stmt_prepare($stmt, $sql)) {}
        
        
        else {
// connect parameters met place holders
            mysqli_stmt_bind_param($stmt, "s", $email);
//Run de prepared statement
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            $row = mysqli_fetch_assoc($result);

            
                if (isset($row['email'])) {
                
                    $email = $row['email'];
                    $pass = $row['password'];

                    mysqli_close($conn);

                    if (password_verify($password, $pass)) {

                        $wwstatus = true;

                    } else {

                        $wwstatus = false;
                    }
                    
                    
                    if($wwstatus) {

                       
                        $_SESSION['login'] = true;
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
                
                $_SESSION['login'] = "geen account gevonden";
                header('Location: login.php');
                exit();
                
            }
        }
    }
}



?>



