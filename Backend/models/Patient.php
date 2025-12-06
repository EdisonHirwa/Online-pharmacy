<?php
// models/Patient.php

class Patient {
    private $conn;
    private $table = 'patients';
    private $users_table = 'users';

    public $patient_id;
    public $date_of_birth;
    public $gender;
    public $blood_group;
    public $medical_history;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create or Update Patient Profile
    public function updateProfile() {
        // Check if patient record exists
        $checkQuery = "SELECT patient_id FROM " . $this->table . " WHERE patient_id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("i", $this->patient_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Update
            $query = "UPDATE " . $this->table . " 
                      SET date_of_birth = ?, gender = ?, blood_group = ?, medical_history = ? 
                      WHERE patient_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ssssi", $this->date_of_birth, $this->gender, $this->blood_group, $this->medical_history, $this->patient_id);
        } else {
            // Insert
            $query = "INSERT INTO " . $this->table . " 
                      (patient_id, date_of_birth, gender, blood_group, medical_history) 
                      VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("issss", $this->patient_id, $this->date_of_birth, $this->gender, $this->blood_group, $this->medical_history);
        }

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get Patient Profile
    public function getProfile() {
        $query = "SELECT u.full_name, u.email, u.phone, u.address, p.* 
                  FROM " . $this->users_table . " u 
                  LEFT JOIN " . $this->table . " p ON u.user_id = p.patient_id 
                  WHERE u.user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->patient_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
}
?>
