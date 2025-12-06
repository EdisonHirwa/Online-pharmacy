<?php
// models/User.php

class User {
    private $conn;
    private $table = 'users';

    public $user_id;
    public $full_name;
    public $email;
    public $password;
    public $role;
    public $phone;
    public $address;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register User
    public function register() {
        $query = "INSERT INTO " . $this->table . " 
                  (full_name, email, password_hash, role, phone, address) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->address = htmlspecialchars(strip_tags($this->address));
        
        // Hash password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bind_param("ssssss", $this->full_name, $this->email, $password_hash, $this->role, $this->phone, $this->address);
        
        if($stmt->execute()) {
            $this->user_id = $stmt->insert_id;
            return true;
        }
        return false;
    }

    // Login User
    public function login() {
        $query = "SELECT user_id, full_name, password_hash, role FROM " . $this->table . " WHERE email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if(password_verify($this->password, $row['password_hash'])) {
                $this->user_id = $row['user_id'];
                $this->full_name = $row['full_name'];
                $this->role = $row['role'];
                return true;
            }
        }
        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT user_id FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $stmt->store_result();
        return $stmt->num_rows > 0;
    }
}
?>
