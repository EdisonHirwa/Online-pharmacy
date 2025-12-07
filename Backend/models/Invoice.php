<?php
// models/Invoice.php

class Invoice {
    private $conn;
    private $table = 'invoices';

    public $invoice_id;
    public $patient_id;
    public $amount;
    public $description;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . " (patient_id, amount, description, status) VALUES (?, ?, ?, 'unpaid')";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ids", $this->patient_id, $this->amount, $this->description);
        return $stmt->execute();
    }

    public function readByPatient($patient_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE patient_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $patient_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function generate($patient_id, $amount, $description) {
        $query = "INSERT INTO " . $this->table . " (patient_id, amount, description, status) VALUES (?, ?, ?, 'unpaid')";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ids", $patient_id, $amount, $description);
        return $stmt->execute();
    }
}
?>
