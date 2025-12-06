<?php
class Notification {
    private $conn;
    private $table = 'notifications';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($user_id, $message) {
        $query = "INSERT INTO " . $this->table . " (user_id, message) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        $message = htmlspecialchars(strip_tags($message));
        $stmt->bind_param("is", $user_id, $message);
        return $stmt->execute();
    }

    public function getUnread($user_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function markAsRead($notification_id) {
        $query = "UPDATE " . $this->table . " SET is_read = TRUE WHERE notification_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $notification_id);
        return $stmt->execute();
    }
}
?>
