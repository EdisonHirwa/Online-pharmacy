<?php
// controllers/labController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/LabTest.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $labTest = new LabTest($conn);
    $result = $labTest->readAll();
    $tests = array();
    while ($row = $result->fetch_assoc()) {
        array_push($tests, $row);
    }
    echo json_encode($tests);
}
elseif ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if ($action === 'update_status') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->test_id) && !empty($data->status)) {
            $query = "UPDATE lab_tests SET status = ? WHERE test_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("si", $data->status, $data->test_id);
            
            if ($stmt->execute()) {
                // Get patient ID to notify
                $p_query = "SELECT patient_id FROM lab_tests WHERE test_id = ?";
                $p_stmt = $conn->prepare($p_query);
                $p_stmt->bind_param("i", $data->test_id);
                $p_stmt->execute();
                $patient_id = $p_stmt->get_result()->fetch_assoc()['patient_id'];

                if ($data->status === 'completed') {
                    include_once '../models/Notification.php';
                    $notify = new Notification($conn);
                    $notify->create($patient_id, "Your lab test results are ready.");
                }

                include_once '../models/Logger.php';
                $logger = new Logger($conn);
                $logger->log($_SESSION['user_id'] ?? 0, 'LAB_TEST_UPDATE', "Test ID " . $data->test_id . " updated to " . $data->status);

                echo json_encode(array("message" => "Test status updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update status."));
            }
        }
    }
}
?>
