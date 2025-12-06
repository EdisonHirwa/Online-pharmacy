<?php
// reset_admin.php
include_once 'Backend/config/connection.php';

$password = 'Admin123!';
$hash = password_hash($password, PASSWORD_BCRYPT);
$email = 'admin@hospital.com';

$query = "UPDATE users SET password_hash = ? WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $hash, $email);

if($stmt->execute()) {
    echo "Admin password reset successfully to: $password";
} else {
    echo "Error resetting password: " . $conn->error;
}
?>
