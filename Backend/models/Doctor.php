<?php
// models/Doctor.php

class Doctor {
    private $conn;
    private $table = 'doctors';
    private $users_table = 'users';

    public $doctor_id;
    public $specialization;
    public $department;
    public $consultation_fee;
    public $schedule;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get All Doctors
    public function readAll() {
        $query = "SELECT u.user_id as doctor_id, u.full_name, u.email, u.phone, d.specialization, d.department, d.consultation_fee, d.schedule 
                  FROM " . $this->users_table . " u 
                  JOIN " . $this->table . " d ON u.user_id = d.doctor_id";
        
        $result = $this->conn->query($query);
        return $result;
    }

    // Get Doctor by ID
    public function readOne() {
        $query = "SELECT u.full_name, u.email, u.phone, d.* 
                  FROM " . $this->users_table . " u 
                  JOIN " . $this->table . " d ON u.user_id = d.doctor_id 
                  WHERE u.user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->doctor_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    // Update Doctor Schedule
    public function updateSchedule($schedule_json) {
        $query = "UPDATE " . $this->table . " SET schedule = ? WHERE doctor_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $schedule_json, $this->doctor_id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get Schedule
    public function getSchedule() {
        $query = "SELECT schedule FROM " . $this->table . " WHERE doctor_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->doctor_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row['schedule'];
    }
}
?>
