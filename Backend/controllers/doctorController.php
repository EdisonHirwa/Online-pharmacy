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

// GET Requests
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
    elseif ($action === 'schedule') {
        $doctor = new Doctor($conn);
        $doctor->doctor_id = $user_id;
        $schedule = $doctor->getSchedule();
        echo json_encode(array("schedule" => json_decode($schedule)));
    }
    elseif ($action === 'patients') {
        // Derive patients from appointments
        $appointment = new Appointment($conn);
        $appointment->doctor_id = $user_id;
        $result = $appointment->readByDoctor();
        $patients = array();
        $patient_ids = array();
        while ($row = $result->fetch_assoc()) {
            if (!in_array($row['patient_id'], $patient_ids)) {
                array_push($patient_ids, $row['patient_id']);
                array_push($patients, array(
                    "patient_id" => $row['patient_id'],
                    "name" => $row['patient_name'],
                    "last_visit" => $row['appointment_date'] // Approximate
                ));
            }
        }
        echo json_encode($patients);
    }
    elseif ($action === 'prescriptions') {
        include_once '../models/Prescription.php';
        $prescription = new Prescription($conn);
        $result = $prescription->readByDoctor($user_id);
        $prescriptions = array();
        while ($row = $result->fetch_assoc()) {
            array_push($prescriptions, $row);
        }
        echo json_encode($prescriptions);
    }
    elseif ($action === 'lab_orders') {
        include_once '../models/LabTest.php';
        $labTest = new LabTest($conn);
        $result = $labTest->readByDoctor($user_id);
        $orders = array();
        while ($row = $result->fetch_assoc()) {
            array_push($orders, $row);
        }
        echo json_encode($orders);
    }
}
// POST Requests
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'update_schedule') {
        $doctor = new Doctor($conn);
        $doctor->doctor_id = $user_id;
        if ($doctor->updateSchedule(json_encode($data->schedule))) {
            echo json_encode(array("message" => "Schedule updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update schedule."));
        }
    }
    elseif ($action === 'add_prescription') {
        include_once '../models/Prescription.php';
        $prescription = new Prescription($conn);
        $prescription->doctor_id = $user_id;
        $prescription->patient_id = $data->patient_id;
        $prescription->medications = $data->medications;
        $prescription->instructions = $data->instructions;
        // Optional: link to appointment if provided
        $prescription->appointment_id = isset($data->appointment_id) ? $data->appointment_id : null;

        if ($prescription->create()) {
            echo json_encode(array("message" => "Prescription issued."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to issue prescription."));
        }
    }
    elseif ($action === 'add_lab_order') {
        include_once '../models/LabTest.php';
        $labTest = new LabTest($conn);
        $labTest->doctor_id = $user_id;
        $labTest->patient_id = $data->patient_id;
        $labTest->test_name = $data->test_type;

        if ($labTest->create()) {
             // Notify Lab (Optional: Implement notification logic)
            echo json_encode(array("message" => "Lab test ordered."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to order lab test."));
        }
    }
    elseif ($action === 'confirm_appointment') {
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
                include_once '../models/Logger.php';
                $notify = new Notification($conn);
                $notify->create($appt['patient_id'], "Your appointment has been confirmed.");
                
                $logger = new Logger($conn);
                $logger->log($user_id, 'APPOINTMENT_CONFIRMED', "Appointment ID " . $data->appointment_id . " confirmed");

                echo json_encode(array("message" => "Appointment confirmed."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to confirm appointment."));
            }
        }
    }
    // Add Consultation Notes
    elseif ($action === 'add_consultation_notes') {
         if (!empty($data->appointment_id) && !empty($data->notes)) {
             // Update appointment notes
             $query = "UPDATE appointments SET notes = ? WHERE appointment_id = ?";
             $stmt = $conn->prepare($query);
             $stmt->bind_param("si", $data->notes, $data->appointment_id);
             if ($stmt->execute()) {
                 echo json_encode(array("message" => "Consultation notes added."));
             } else {
                 http_response_code(503);
                 echo json_encode(array("message" => "Unable to add notes."));
             }
         }
    }
}
?>
