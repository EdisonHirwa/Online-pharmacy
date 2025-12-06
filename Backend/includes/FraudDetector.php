<?php
class FraudDetector {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function detectDuplicateAccounts($email, $ip_address) {
        // Check for same IP creating multiple accounts in short time
        $query = "SELECT COUNT(*) as count FROM users 
                  WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) 
                  AND user_id IN (SELECT user_id FROM audit_logs WHERE ip_address = ? AND action = 'register')";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $ip_address);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if ($result['count'] > 3) {
            $this->raiseAlert(null, 'Multiple Registrations', "Suspicious activity: Multiple registrations from IP $ip_address");
        }
    }

    public function detectSuspiciousTransaction($user_id, $amount) {
        // Threshold for suspicious amount
        if ($amount > 5000) {
             $this->raiseAlert($user_id, 'High Value Transaction', "Transaction of $$amount exceeds manual review threshold.");
        }

        // Check for rapid payments (e.g. > 3 in 10 mins)
        $query = "SELECT COUNT(*) as count FROM payments 
                  WHERE invoice_id IN (SELECT invoice_id FROM invoices WHERE patient_id = ?) 
                  AND payment_date > DATE_SUB(NOW(), INTERVAL 10 MINUTE)";
        // Note: This query assumes linkage back to patient. Simplified:
        // We log it if we have context.
    }

    public function checkSuspiciousLogin($user_id) {
        // Simple check: if login from different IP than last successful login (simplified for now)
        // In real app, would track geo-location or known IPs
        return false; 
    }

    public function raiseAlert($user_id, $type, $description) {
        $query = "INSERT INTO fraud_alerts (user_id, alert_type, description, status) VALUES (?, ?, ?, 'new')";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iss", $user_id, $type, $description);
        $stmt->execute();
    }
}
?>
