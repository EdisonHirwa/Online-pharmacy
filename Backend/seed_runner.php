<?php
// seed_runner.php
// A simple script to run the seed SQL commands
include_once 'config/connection.php';

header('Content-Type: text/plain');

$sql = "
INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES 
('Dr. Sarah Wilson', 'sarah.wilson@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0101', '123 Medical Ctr'),
('Dr. James Chen', 'james.chen@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0102', '456 Cardio Wing'),
('Dr. Emily Davis', 'emily.davis@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0103', '789 Neuro Dept'),
('Dr. Michael Brown', 'michael.brown@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', '555-0104', '321 Peds Lane');

INSERT INTO doctors (doctor_id, specialization, department, consultation_fee, schedule)
SELECT user_id, 'Cardiology', 'Cardiology', 150.00, '{\"mon\": \"09:00-17:00\", \"wed\": \"09:00-17:00\", \"fri\": \"09:00-13:00\"}'
FROM users WHERE email = 'sarah.wilson@hospital.com';

INSERT INTO doctors (doctor_id, specialization, department, consultation_fee, schedule)
SELECT user_id, 'Orthopedics', 'Orthopedics', 120.00, '{\"tue\": \"10:00-18:00\", \"thu\": \"10:00-18:00\"}'
FROM users WHERE email = 'james.chen@hospital.com';

INSERT INTO doctors (doctor_id, specialization, department, consultation_fee, schedule)
SELECT user_id, 'Neurology', 'Neurology', 200.00, '{\"mon\": \"08:00-16:00\", \"wed\": \"08:00-16:00\"}'
FROM users WHERE email = 'emily.davis@hospital.com';

INSERT INTO doctors (doctor_id, specialization, department, consultation_fee, schedule)
SELECT user_id, 'Pediatrics', 'Pediatrics', 100.00, '{\"mon\": \"09:00-17:00\", \"tue\": \"09:00-17:00\", \"wed\": \"09:00-17:00\", \"thu\": \"09:00-17:00\", \"fri\": \"09:00-17:00\"}'
FROM users WHERE email = 'michael.brown@hospital.com';
";

if ($conn->multi_query($sql)) {
    echo "Seed data inserted successfully.";
    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
} else {
    echo "Error inserting seed data: " . $conn->error;
}

$conn->close();
?>
