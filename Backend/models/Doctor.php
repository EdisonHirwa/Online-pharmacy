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
        $query = "SELECT u.user_id, u.full_name, u.email, u.phone, d.specialization, d.department, d.consultation_fee 
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
}
?>
