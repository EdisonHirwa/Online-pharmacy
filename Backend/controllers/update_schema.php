<?php
include_once '../config/connection.php';

// Add is_available column to doctors table if it doesn't exist
$check = $conn->query("SHOW COLUMNS FROM doctors LIKE 'is_available'");
if ($check->num_rows == 0) {
    $conn->query("ALTER TABLE doctors ADD COLUMN is_available BOOLEAN DEFAULT 1");
    echo "Added is_available to doctors.\n";
} else {
    echo "is_available already exists.\n";
}

// Add failed_login_attempts to users if not exists (or create a separate tracking table, but column is easier for now)
// Actually, for better security/logging, a separate login_attempts table is better, but user asked for "basic php". 
// Let's stick to audit logs for failed logins and just count them in FraudDetector.

echo "Schema update complete.\n";
?>
