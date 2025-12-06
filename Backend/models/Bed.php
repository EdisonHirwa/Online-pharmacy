<?php
class Bed {
    private $conn;
    private $table = 'beds';

    public $bed_id;
    public $ward_name;
    public $bed_number;
    public $type;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all beds
    public function read() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get single bed
    public function read_single() {
        $query = "SELECT * FROM " . $this->table . " WHERE bed_id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->bed_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    // Create bed
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET ward_name = ?, bed_number = ?, type = ?, status = ?";
        
        $stmt = $this->conn->prepare($query);

        $this->ward_name = htmlspecialchars(strip_tags($this->ward_name));
        $this->bed_number = htmlspecialchars(strip_tags($this->bed_number));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bind_param("ssss", $this->ward_name, $this->bed_number, $this->type, $this->status);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update bed status
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table . " SET status = ? WHERE bed_id = ?";
        $stmt = $this->conn->prepare($query);
        
        $status = htmlspecialchars(strip_tags($status));
        $id = htmlspecialchars(strip_tags($id));
        
        $stmt->bind_param("si", $status, $id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>
