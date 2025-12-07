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
    elseif ($action === 'metrics') {
        // Return dashboard metrics for doctor
        $metrics = array();
        
        // Total unique patients from appointments
        $query = "SELECT COUNT(DISTINCT patient_id) as total FROM appointments WHERE doctor_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['total_patients'] = $stmt->get_result()->fetch_assoc()['total'];
        
        // Upcoming appointments today
        $query = "SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE() AND status != 'cancelled'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['appointments_today'] = $stmt->get_result()->fetch_assoc()['total'];
        
        // Pending lab tests
        include_once '../models/LabTest.php';
        $query = "SELECT COUNT(*) as total FROM lab_tests WHERE doctor_id = ? AND status = 'pending'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['pending_lab_tests'] = $stmt->get_result()->fetch_assoc()['total'];
        
        echo json_encode($metrics);
    }
}
// POST Requests
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($_GET['action']) ? $_GET['action'] : '';


include_once '../models/Logger.php';
$logger = new Logger($conn);

// ... existing code ...

    if ($action === 'update_schedule') {
        $doctor = new Doctor($conn);
        $doctor->doctor_id = $user_id;
        if ($doctor->updateSchedule(json_encode($data->schedule))) {
            $logger->log($user_id, 'SCHEDULE_UPDATE', 'Doctor updated availability schedule');
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
            $logger->log($user_id, 'PRESCRIPTION_ISSUED', "Prescription issued to Patient ID: " . $data->patient_id);
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
            $logger->log($user_id, 'LAB_ORDER_CREATED', "Lab test ordered for Patient ID: " . $data->patient_id);
            echo json_encode(array("message" => "Lab test ordered."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to order lab test."));
        }
    }
// ... confirm_appointment (already logged) ...
    // Add Consultation Notes
    elseif ($action === 'add_consultation_notes') {
         if (!empty($data->appointment_id) && !empty($data->notes)) {
             // Update appointment notes
             $query = "UPDATE appointments SET notes = ? WHERE appointment_id = ?";
             $stmt = $conn->prepare($query);
             $stmt->bind_param("si", $data->notes, $data->appointment_id);
             if ($stmt->execute()) {
                 $logger->log($user_id, 'CONSULTATION_NOTES_ADDED', "Notes added to Appointment ID: " . $data->appointment_id);
                 echo json_encode(array("message" => "Consultation notes added."));
             } else {
                 http_response_code(503);
                 echo json_encode(array("message" => "Unable to add notes."));
             }
         }
    }
}
?>
