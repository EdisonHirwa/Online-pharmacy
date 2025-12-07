<?php
// includes/FraudDetector.php

class FraudDetector {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function detectDuplicateAccounts($email, $ip_address) {
        // Check for existing email (Standard, but explicit here)
        $query = "SELECT user_id FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            // Already handled in controller, but good practice
            return true;
        }

        // Check velocity: Too many registrations from same IP in last hour
        $query = "SELECT COUNT(*) as count FROM audit_logs WHERE action = 'REGISTER' AND ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $ip_address);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if ($row['count'] > 3) {
            // Log this suspicious activity
            $this->logSuspicious($ip_address, "High registration velocity");
            // Could throw exception or return false to block
            return true; 
        }

        return false;
    }

    private function logSuspicious($ip, $reason) {
        // Log to specific fraud log or main audit log
        $query = "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (0, 'FRAUD_ALERT', ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ss", $reason, $ip);
        $stmt->execute();
    }
}
?>
