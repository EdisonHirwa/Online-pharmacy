<?php
// Test appointment booking and check triggers
header('Content-Type: text/plain');
include_once 'config/connection.php';

echo "=== Testing Appointment Booking ===\n\n";

// Create a test patient if not exists
$test_patient_email = 'patient@test.com';
$conn->query("INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES ('Test Patient', '$test_patient_email', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient')");
$patient_result = $conn->query("SELECT user_id FROM users WHERE email = '$test_patient_email'");
$patient_id = $patient_result->fetch_assoc()['user_id'];
echo "✓ Test patient ID: $patient_id\n";

// Insert into patients table if needed
$conn->query("INSERT IGNORE INTO patients (patient_id) VALUES ($patient_id)");

// Get a doctor
$doctor_result = $conn->query("SELECT doctor_id FROM doctors LIMIT 1");
$doctor_id = $doctor_result->fetch_assoc()['doctor_id'];
echo "✓ Test doctor ID: $doctor_id\n\n";

// Check notifications before
$notif_before = $conn->query("SELECT COUNT(*) as count FROM notifications")->fetch_assoc()['count'];
echo "Notifications before: $notif_before\n";

// Create appointment
include_once 'models/Appointment.php';
$appointment = new Appointment($conn);
$appointment->patient_id = $patient_id;
$appointment->doctor_id = $doctor_id;
$appointment->appointment_date = date('Y-m-d H:i:s', strtotime('+1 day'));
$appointment->notes = 'Test appointment';

if ($appointment->create()) {
    echo "✓ Appointment created successfully\n\n";
    
    // Check notifications after (should be +2 if trigger worked)
    $notif_after = $conn->query("SELECT COUNT(*) as count FROM notifications")->fetch_assoc()['count'];
    echo "Notifications after: $notif_after\n";
    echo "New notifications: " . ($notif_after - $notif_before) . " (should be 2)\n\n";
    
    // Show recent notifications
    echo "Recent notifications:\n";
    $notifs = $conn->query("SELECT user_id, message, created_at FROM notifications ORDER BY created_at DESC LIMIT 3");
    while ($n = $notifs->fetch_assoc()) {
        echo "  - User {$n['user_id']}: {$n['message']}\n";
    }
    
    echo "\n--- Fetching via Appointment model ---\n";
    $apt_model = new Appointment($conn);
    $apt_model->patient_id = $patient_id;
    $result = $apt_model->readByPatient();
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $count++;
        echo "Appointment #{$row['appointment_id']}: {$row['appointment_date']} with Dr. {$row['doctor_name']}\n";
    }
    echo "Total appointments for patient: $count\n";
} else {
    echo "✗ Failed to create appointment: " . $conn->error . "\n";
}

$conn->close();
?>
