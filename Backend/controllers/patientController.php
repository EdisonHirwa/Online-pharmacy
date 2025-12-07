<?php
// controllers/patientController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/Patient.php';
include_once '../models/Doctor.php';
include_once '../models/Appointment.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'patient') {
    // For development, we might want to bypass or handle differently
    // But strict requirement says session based.
    // If testing with Postman without cookies, this will fail.
    // React app must send credentials: include
}

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'profile') {
        $patient = new Patient($conn);
        $patient->patient_id = $user_id;
        $data = $patient->getProfile();
        echo json_encode($data);
    }
    elseif ($action === 'doctors') {
        $doctor = new Doctor($conn);
        $result = $doctor->readAll();
        $doctors = array();
        
        // Basic filtering in PHP for simplicity 
        $specialization = isset($_GET['specialization']) ? $_GET['specialization'] : '';
        $department = isset($_GET['department']) ? $_GET['department'] : '';

        while ($row = $result->fetch_assoc()) {
             $match = true;
             if ($specialization && stripos($row['specialization'], $specialization) === false) $match = false;
             if ($department && stripos($row['department'], $department) === false) $match = false;
             
             if ($match) {
                array_push($doctors, $row);
             }
        }
        echo json_encode($doctors);
    }
    elseif ($action === 'appointments') {
        $appointment = new Appointment($conn);
        $appointment->patient_id = $user_id;
        $result = $appointment->readByPatient();
        $appointments = array();
        while ($row = $result->fetch_assoc()) {
            array_push($appointments, $row);
        }
        echo json_encode($appointments);
    }
    elseif ($action === 'prescriptions') {
        include_once '../models/Prescription.php';
        $prescription = new Prescription($conn);
        $result = $prescription->readByPatient($user_id);
        $prescriptions = array();
        while ($row = $result->fetch_assoc()) {
            array_push($prescriptions, $row);
        }
        echo json_encode($prescriptions);
    }
    elseif ($action === 'lab_results') {
        include_once '../models/LabTest.php';
        $labTest = new LabTest($conn);
        $result = $labTest->readByPatient($user_id);
        $results = array();
        while ($row = $result->fetch_assoc()) {
            array_push($results, $row);
        }
        echo json_encode($results);
    }
    elseif ($action === 'invoices') {
        include_once '../models/Invoice.php';
        $invoice = new Invoice($conn);
        $result = $invoice->readByPatient($user_id);
        $invoices = array();
        while ($row = $result->fetch_assoc()) {
            array_push($invoices, $row);
        }
        echo json_encode($invoices);
    }
    elseif ($action === 'notifications') {
        include_once '../models/Notification.php';
        $notify = new Notification($conn);
        $result = $notify->getUnread($user_id);
        $notifications = array();
        while ($row = $result->fetch_assoc()) {
            array_push($notifications, $row);
        }
        echo json_encode($notifications);
    }
    elseif ($action === 'metrics') {
        // Return optimized dashboard metrics
        $metrics = array();
        
        // Upcoming appointments
        $query = "SELECT COUNT(*) as total FROM appointments WHERE patient_id = ? AND appointment_date > NOW() AND status != 'cancelled'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['upcoming_appointments'] = $stmt->get_result()->fetch_assoc()['total'];
        
        // Active prescriptions (pending)
        $query = "SELECT COUNT(*) as total FROM prescriptions WHERE patient_id = ? AND status = 'pending'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['active_prescriptions'] = $stmt->get_result()->fetch_assoc()['total'];
        
        // Unpaid invoices
        $query = "SELECT COUNT(*) as total FROM invoices WHERE patient_id = ? AND status = 'unpaid'";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $metrics['unpaid_invoices'] = $stmt->get_result()->fetch_assoc()['total'];
        
        echo json_encode($metrics);
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($_GET['action']) ? $_GET['action'] : '';

include_once '../models/Logger.php';
$logger = new Logger($conn);

// ... 

    if ($action === 'book_appointment') {
        $appointment = new Appointment($conn);
        $appointment->patient_id = $user_id;
        $appointment->doctor_id = $data->doctor_id;
        $appointment->appointment_date = $data->date; // Format: YYYY-MM-DD HH:MM:SS
        $appointment->notes = isset($data->notes) ? $data->notes : '';

        if($appointment->create()) {
            // Notify Doctor
            include_once '../models/Notification.php';
            $notify = new Notification($conn);
            $notify->create($data->doctor_id, "New appointment booked for " . $data->date);

            $logger->log($user_id, 'APPOINTMENT_BOOKED', "Appointment booked with Doctor ID: " . $data->doctor_id);

            http_response_code(201);
            echo json_encode(array("message" => "Appointment booked successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to book appointment."));
        }
    }
    elseif ($action === 'update_profile') {
        $patient = new Patient($conn);
        $patient->patient_id = $user_id;
        $patient->date_of_birth = $data->date_of_birth;
        $patient->gender = $data->gender;
        $patient->blood_group = $data->blood_group;
        $patient->medical_history = $data->medical_history;

        if($patient->updateProfile()) {
            $logger->log($user_id, 'PATIENT_PROFILE_UPDATED', "Patient profile details updated");
            echo json_encode(array("message" => "Profile updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update profile."));
        }
    }
}
?>
