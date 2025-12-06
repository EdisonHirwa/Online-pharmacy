<?php
// controllers/doctorController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/Doctor.php';
include_once '../models/Appointment.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'appointments') {
        $appointment = new Appointment($conn);
        $appointment->doctor_id = $user_id;
        $result = $appointment->readByDoctor();
        $appointments = array();
        while ($row = $result->fetch_assoc()) {
            array_push($appointments, $row);
        }
        echo json_encode($appointments);
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // Add consultation notes, etc.
    if ($action === 'confirm_appointment') {
        if (!empty($data->appointment_id)) {
            $query = "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $data->appointment_id);
            
            if ($stmt->execute()) {
                // Get patient ID
                $a_query = "SELECT patient_id FROM appointments WHERE appointment_id = ?";
                $a_stmt = $conn->prepare($a_query);
                $a_stmt->bind_param("i", $data->appointment_id);
                $a_stmt->execute();
                $appt = $a_stmt->get_result()->fetch_assoc();

                include_once '../models/Notification.php';
                $notify = new Notification($conn);
                $notify->create($appt['patient_id'], "Your appointment has been confirmed.");

                echo json_encode(array("message" => "Appointment confirmed."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to confirm appointment."));
            }
        }
    }
?>
