<?php
// Clear opcache and insert doctors
if (function_exists('opcache_reset')) {
    opcache_reset();
}

header('Content-Type: text/plain');
include_once 'config/connection.php';

// First, insert doctor users
$insert_users_sql = "
INSERT IGNORE INTO users (full_name, email, password_hash, role, phone, address) VALUES 
('Dr. Sarah Wilson', 'sarah.wilson@hospital.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0101', '123 Medical Ctr'),
('Dr. James Chen', 'james.chen@hospital.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0102', '456 Cardio Wing'),
('Dr. Emily Davis', 'emily.davis@hospital.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0103', '789 Neuro Dept'),
('Dr. Michael Brown', 'michael.brown@hospital.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0104', '321 Peds Lane')
";

if ($conn->query($insert_users_sql)) {
    echo "✓ Doctor users inserted\n";
} else {
    echo "Doctor users: " . $conn->error . "\n";
}

// Then insert doctor profiles
$doctors_data = [
    ['sarah.wilson@hospital.com', 'Cardiology', 'Cardiology', 150.00],
    ['james.chen@hospital.com', 'Orthopedics', 'Orthopedics', 120.00],
    ['emily.davis@hospital.com', 'Neurology', 'Neurology', 200.00],
    ['michael.brown@hospital.com', 'Pediatrics', 'Pediatrics', 100.00]
];

foreach ($doctors_data as $doctor) {
    $sql = "INSERT IGNORE INTO doctors (doctor_id, specialization, department, consultation_fee, schedule)
            SELECT user_id, ?, ?, ?, '{\"availability\": \"weekdays\"}'
            FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssds", $doctor[1], $doctor[2], $doctor[3], $doctor[0]);
    if ($stmt->execute()) {
        echo "✓ Doctor profile for {$doctor[0]} inserted\n";
    } else {
        echo "Error for {$doctor[0]}: " . $stmt->error . "\n";
    }
}

echo "\n--- Verification ---\n";
// Now check what we have
include_once 'models/Doctor.php';
$doctorModel = new Doctor($conn);
$result = $doctorModel->readAll();
$count = 0;
while ($row = $result->fetch_assoc()) {
    $count++;
    echo "{$count}. Dr. {$row['full_name']} - {$row['specialization']}\n";
}

echo "\nTotal doctors: $count\n";

$conn->close();
?>
