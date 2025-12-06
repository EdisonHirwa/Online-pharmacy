<?php
// models/LabTest.php

class LabTest {
    private $conn;
    private $table = 'lab_tests';

    public $test_id;
    public $patient_id;
    public $doctor_id;
    public $test_name;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " (patient_id, doctor_id, test_name, status) VALUES (?, ?, ?, 'pending')";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iis", $this->patient_id, $this->doctor_id, $this->test_name);
        return $stmt->execute();
    }

    public function readAll() {
        $query = "SELECT l.*, p_user.full_name as patient_name, d_user.full_name as doctor_name 
                  FROM " . $this->table . " l 
                  JOIN patients p ON l.patient_id = p.patient_id 
                  JOIN users p_user ON p.patient_id = p_user.user_id 
                  JOIN doctors d ON l.doctor_id = d.doctor_id 
                  JOIN users d_user ON d.doctor_id = d_user.user_id 
                  ORDER BY l.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }
}
?>
