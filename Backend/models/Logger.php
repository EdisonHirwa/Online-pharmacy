<?php
// models/Logger.php

class Logger {
    private $conn;
    private $table = 'audit_logs';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function log($user_id, $action, $details = '') {
        $query = "INSERT INTO " . $this->table . " (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        $ip = $_SERVER['REMOTE_ADDR'];
        $details = htmlspecialchars(strip_tags($details));
        
        $stmt->bind_param("isss", $user_id, $action, $details, $ip);
        return $stmt->execute();
    }

    public function getRecentLogs($limit = 5) {
        $query = "SELECT l.*, u.full_name, u.role 
                  FROM " . $this->table . " l 
                  LEFT JOIN users u ON l.user_id = u.user_id 
                  ORDER BY l.created_at DESC LIMIT ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        return $stmt->get_result();
    }
}
?>
