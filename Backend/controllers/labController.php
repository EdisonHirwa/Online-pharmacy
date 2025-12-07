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
        // Handle multipart/form-data, so input is in $_POST and $_FILES
        $test_id = $_POST['test_id'];
        $status = $_POST['status'];
        
        if (!empty($test_id) && !empty($status)) {
            $report_path = null;
            if (isset($_FILES['report']) && $_FILES['report']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $fileName = time() . '_' . basename($_FILES['report']['name']);
                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['report']['tmp_name'], $targetPath)) {
                    // Store relative path accessible by frontend if served correctly, 
                    // or absolute URL. For XAMPP default:
                    $report_path = 'http://localhost/Online_pharmacy/Backend/uploads/' . $fileName;
                }
            }

            $query = "UPDATE lab_tests SET status = ?";
            if ($report_path) {
                $query .= ", report_path = ?";
            }
            $query .= " WHERE test_id = ?";
            
            $stmt = $conn->prepare($query);
            if ($report_path) {
                $stmt->bind_param("ssi", $status, $report_path, $test_id);
            } else {
                $stmt->bind_param("si", $status, $test_id);
            }
            
            if ($stmt->execute()) {
                // Get patient ID to notify
                $p_query = "SELECT patient_id FROM lab_tests WHERE test_id = ?";
                $p_stmt = $conn->prepare($p_query);
                $p_stmt->bind_param("i", $test_id);
                $p_stmt->execute();
                $patient_id = $p_stmt->get_result()->fetch_assoc()['patient_id'];

                if ($status === 'completed') {
                    include_once '../models/Notification.php';
                    $notify = new Notification($conn);
                    $notify->create($patient_id, "Your lab test results are ready.");
                }

                include_once '../models/Logger.php';
                $logger = new Logger($conn);
                $logger->log($_SESSION['user_id'] ?? 0, 'LAB_TEST_UPDATE', "Test ID " . $test_id . " updated to " . $status);

                echo json_encode(array("message" => "Test status updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update status."));
            }
        }
    }
}
?>
