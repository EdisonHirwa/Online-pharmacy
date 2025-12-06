<?php
// controllers/paymentController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../includes/FraudDetector.php';
include_once '../models/Logger.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0; // Default to 0 if not logged in (though should be)

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'process_payment') {
        if (!empty($data->invoice_id) && !empty($data->amount) && !empty($data->payment_method)) {
            
            // 1. Fraud Check
            $fraud = new FraudDetector($conn);
            $fraud->detectSuspiciousTransaction($user_id, $data->amount);

            // 2. Process Payment (Insert)
            $query = "INSERT INTO payments (invoice_id, amount, payment_method) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ids", $data->invoice_id, $data->amount, $data->payment_method);

            if ($stmt->execute()) {
                // 3. Log Action
                $logger = new Logger($conn);
                $logger->log($user_id, 'PAYMENT_PROCESSED', "Payment of $" . $data->amount . " processed for Invoice ID " . $data->invoice_id);

                http_response_code(201);
                echo json_encode(array("message" => "Payment processed successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to process payment."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    }
}
?>
