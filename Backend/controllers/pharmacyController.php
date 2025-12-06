<?php
// controllers/pharmacyController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/Prescription.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $prescription = new Prescription($conn);
    $result = $prescription->readPending();
    $prescriptions = array();
    while ($row = $result->fetch_assoc()) {
        array_push($prescriptions, $row);
    }
    echo json_encode($prescriptions);
}
elseif ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if ($action === 'dispense') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->prescription_id)) {
            $query = "UPDATE prescriptions SET status = 'dispensed' WHERE prescription_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $data->prescription_id);
            
            if ($stmt->execute()) {
                // Get patient ID
                $p_query = "SELECT patient_id FROM prescriptions WHERE prescription_id = ?";
                $p_stmt = $conn->prepare($p_query);
                $p_stmt->bind_param("i", $data->prescription_id);
                $p_stmt->execute();
                $presc = $p_stmt->get_result()->fetch_assoc();

                include_once '../models/Notification.php';
                $notify = new Notification($conn);
                $notify->create($presc['patient_id'], "Your prescription gets ready. Please collect it.");

                echo json_encode(array("message" => "Prescription dispensed."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to dispense."));
            }
        }
    }
}
?>
