<?php
header('Content-Type: application/json');
include_once 'config/connection.php';

// Check users with doctor role
$users_query = "SELECT user_id, full_name, email, role FROM users WHERE role = 'doctor'";
$users_result = $conn->query($users_query);
$doctor_users = [];
while ($row = $users_result->fetch_assoc()) {
    $doctor_users[] = $row;
}

// Check doctors table
$doctors_query = "SELECT * FROM doctors";
$doctors_result = $conn->query($doctors_query);
$doctor_profiles = [];
while ($row = $doctors_result->fetch_assoc()) {
    $doctor_profiles[] = $row;
}

// Check what the API actually returns
include_once 'models/Doctor.php';
$doctor = new Doctor($conn);
$result = $doctor->readAll();
$api_doctors = [];
while ($row = $result->fetch_assoc()) {
    $api_doctors[] = $row;
}

echo json_encode([
    'doctor_users_count' => count($doctor_users),
    'doctor_users' => $doctor_users,
    'doctor_profiles_count' => count($doctor_profiles),
    'doctor_profiles' => $doctor_profiles,
    'api_returns_count' => count($api_doctors),
    'api_returns' => $api_doctors
], JSON_PRETTY_PRINT);

$conn->close();
?>
