<?php

$db_sever = "db";
$db_user = getenv("DB_USER");
$db_pass = getenv("DB_PASSWORD");
$db_name = getenv("DB_NAME");
$conn = "";

try{
    $conn = mysqli_connect(

        $db_sever,
        $db_user,
        $db_pass,
        $db_name
    );
}
catch(mysqli_sql_exception){
    $status_conn = "could not connect to the database ";
}  


if($conn){

    $status_conn = "you are connected to the database ";
}

//echo $status_conn;


?>