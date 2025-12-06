<?php
// models/Appointment.php

class Appointment {
    private $conn;
    private $table = 'appointments';

    public $appointment_id;
    public $patient_id;
    public $doctor_id;
    public $appointment_date;
    public $status;
    public $notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create Appointment
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (patient_id, doctor_id, appointment_date, status, notes) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        $this->status = 'pending';
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        
        $stmt->bind_param("iisss", $this->patient_id, $this->doctor_id, $this->appointment_date, $this->status, $this->notes);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get Patient Appointments
    public function readByPatient() {
        $query = "SELECT a.*, u.full_name as doctor_name, d.specialization 
                  FROM " . $this->table . " a 
                  JOIN doctors d ON a.doctor_id = d.doctor_id 
                  JOIN users u ON d.doctor_id = u.user_id 
                  WHERE a.patient_id = ? 
                  ORDER BY a.appointment_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->patient_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    // Get Doctor Appointments
    public function readByDoctor() {
        $query = "SELECT a.*, u.full_name as patient_name 
                  FROM " . $this->table . " a 
                  JOIN patients p ON a.patient_id = p.patient_id 
                  JOIN users u ON p.patient_id = u.user_id 
                  WHERE a.doctor_id = ? 
                  ORDER BY a.appointment_date ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->doctor_id);
        $stmt->execute();
        return $stmt->get_result();
    }
}
?>
