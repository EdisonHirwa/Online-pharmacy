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
}
?>
