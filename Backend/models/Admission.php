<?php
class Admission {
    private $conn;
    private $table = 'admissions';

    public $admission_id;
    public $patient_id;
    public $bed_id;
    public $doctor_id;
    public $admission_date;
    public $discharge_date;
    public $reason;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create admission
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  SET patient_id = ?, bed_id = ?, doctor_id = ?, admission_date = ?, reason = ?, status = 'admitted'";
        
        $stmt = $this->conn->prepare($query);

        $this->admission_date = date('Y-m-d H:i:s');
        $this->reason = htmlspecialchars(strip_tags($this->reason));

        $stmt->bind_param("iiiss", $this->patient_id, $this->bed_id, $this->doctor_id, $this->admission_date, $this->reason);

        if($stmt->execute()) {
            // Update bed status to occupied
            $bedQuery = "UPDATE beds SET status = 'occupied' WHERE bed_id = ?";
            $bedStmt = $this->conn->prepare($bedQuery);
            $bedStmt->bind_param("i", $this->bed_id);
            $bedStmt->execute();
            
            return true;
        }
        return false;
    }

    // Discharge patient
    public function discharge($id) {
        $query = "UPDATE " . $this->table . " 
                  SET status = 'discharged', discharge_date = NOW() 
                  WHERE admission_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);

        if($stmt->execute()) {
            // Get bed_id to release it
            $getBedQuery = "SELECT bed_id FROM " . $this->table . " WHERE admission_id = ?";
            $getBedStmt = $this->conn->prepare($getBedQuery);
            $getBedStmt->bind_param("i", $id);
            $getBedStmt->execute();
            $result = $getBedStmt->get_result();
            if($row = $result->fetch_assoc()) {
                $bed_id = $row['bed_id'];
                // Update bed status to available
                $bedUpdateQuery = "UPDATE beds SET status = 'available' WHERE bed_id = ?";
                $bedUpdateStmt = $this->conn->prepare($bedUpdateQuery);
                $bedUpdateStmt->bind_param("i", $bed_id);
                $bedUpdateStmt->execute();
            }
            return true;
        }
        return false;
    }
}
?>
