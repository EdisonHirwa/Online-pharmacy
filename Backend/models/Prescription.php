<?php
// models/Prescription.php

class Prescription {
    private $conn;
    private $table = 'prescriptions';

    public $prescription_id;
    public $appointment_id;
    public $doctor_id;
    public $patient_id;
    public $medications;
    public $instructions;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " (appointment_id, doctor_id, patient_id, medications, instructions, status) VALUES (?, ?, ?, ?, ?, 'pending')";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iiiss", $this->appointment_id, $this->doctor_id, $this->patient_id, $this->medications, $this->instructions);
        return $stmt->execute();
    }

    public function readPending() {
        $query = "SELECT pr.*, p_user.full_name as patient_name, d_user.full_name as doctor_name 
                  FROM " . $this->table . " pr 
                  JOIN patients p ON pr.patient_id = p.patient_id 
                  JOIN users p_user ON p.patient_id = p_user.user_id 
                  JOIN doctors d ON pr.doctor_id = d.doctor_id 
                  JOIN users d_user ON d.doctor_id = d_user.user_id 
                  WHERE pr.status = 'pending'";
        $result = $this->conn->query($query);
        return $result;
    }
}
?>
