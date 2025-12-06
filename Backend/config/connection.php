<?php
// config/connection.php

$host = 'localhost';
$db_name = 'hospital_management';
$username = 'root';
$password = ''; // Default XAMPP password is empty

$conn = new mysqli($host, $username, $password, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");
?>
