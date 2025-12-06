<?php
// verify_system.php
include_once '../Backend/config/connection.php';
include_once '../Backend/includes/FraudDetector.php';
include_once '../Backend/models/Logger.php';

echo "=== SYSTEM VERIFICATION RAPORT ===\n\n";

// 1. Check Doctor Availability Schema
echo "[1] Checking Doctor Availability Schema...\n";
$check = $conn->query("SHOW COLUMNS FROM doctors LIKE 'is_available'");
if ($check->num_rows > 0) {
    echo "PASS: 'is_available' column exists in 'doctors' table.\n";
} else {
    echo "FAIL: 'is_available' column MISSING.\n";
}

// 2. Check Fraud Detection (Suspicious Transaction)
echo "\n[2] Testing Fraud Detection...\n";
// Fetch a valid user ID
$user_query = $conn->query("SELECT user_id FROM users LIMIT 1");
if ($user_query->num_rows > 0) {
    $valid_user_id = $user_query->fetch_assoc()['user_id'];
} else {
    die("FAIL: No users found in database to test with.\n");
}

// 2. Check Fraud Detection (Suspicious Transaction)
echo "\n[2] Testing Fraud Detection...\n";
$fraud = new FraudDetector($conn);
// Simulate a high value transaction
$fraud->detectSuspiciousTransaction($valid_user_id, 6000);
$res = $conn->query("SELECT * FROM fraud_alerts ORDER BY alert_id DESC LIMIT 1");
if ($res->num_rows > 0) {
    $alert = $res->fetch_assoc();
    if (strpos($alert['description'], '6000') !== false) {
        echo "PASS: Fraud alert triggered for high value transaction.\n";
        echo "Alert Details: " . $alert['description'] . "\n";
    } else {
        echo "WARN: Latest alert does not match test case.\n";
    }
} else {
    echo "FAIL: No fraud alerts found.\n";
}

// 3. Check Audit Logging
echo "\n[3] Checking Audit Logs...\n";
// Log a test entry
$logger = new Logger($conn);
$logger->log($valid_user_id, 'TEST_VERIFICATION', 'System check completed');
$res = $conn->query("SELECT * FROM audit_logs WHERE action='TEST_VERIFICATION' ORDER BY log_id DESC LIMIT 1");
if ($res->num_rows > 0) {
    echo "PASS: Audit log functionality active.\n";
} else {
    echo "FAIL: Could not write/read from audit_logs.\n";
}

// 4. Check Medical Records Export Logic
echo "\n[4] Checking Admin Controller for Export Logic...\n";
$adminCtrl = file_get_contents('../Backend/controllers/adminController.php');
if (strpos($adminCtrl, 'medical_records') !== false && strpos($adminCtrl, 'fputcsv') !== false) {
    echo "PASS: 'medical_records' export logic found in adminController.php.\n";
} else {
    echo "FAIL: Export logic seems missing.\n";
}

// 5. Check Failed Login Logic
echo "\n[5] Checking Auth Controller for Failed Login Logic...\n";
$authCtrl = file_get_contents('../Backend/controllers/authController.php');
if (strpos($authCtrl, 'FAILED_LOGIN') !== false) {
    echo "PASS: 'FAILED_LOGIN' logging found in authController.php.\n";
} else {
    echo "FAIL: Failed login logging seems missing.\n";
}

echo "\n=== VERIFICATION COMPLETE ===\n";
?>
