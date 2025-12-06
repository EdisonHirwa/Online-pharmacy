<?php
// controllers/adminController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/User.php';
include_once '../models/Logger.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'users') {
        $query = "SELECT user_id, full_name, email, role, created_at FROM users";
        $result = $conn->query($query);
        $users = array();
        while ($row = $result->fetch_assoc()) {
            array_push($users, $row);
        }
        echo json_encode($users);
    }
    elseif ($action === 'stats') {
        $logger = new Logger($conn);
        $logs_result = $logger->getRecentLogs(5);
        $logs = array();
        while ($row = $logs_result->fetch_assoc()) {
            array_push($logs, $row);
        }

        // Mock stats for dashboard - enhanced with real DB queries
        $stats = array(
            "patients" => $conn->query("SELECT COUNT(*) as count FROM users WHERE role='patient'")->fetch_assoc()['count'],
            "doctors" => $conn->query("SELECT COUNT(*) as count FROM users WHERE role='doctor'")->fetch_assoc()['count'],
            "appointments" => $conn->query("SELECT COUNT(*) as count FROM appointments")->fetch_assoc()['count'],
            "revenue" => $conn->query("SELECT SUM(amount) as total FROM payments")->fetch_assoc()['total'] ?? 0,
            
            // New Metrics
            "beds_available" => $conn->query("SELECT COUNT(*) as count FROM beds WHERE status='available'")->fetch_assoc()['count'] ?? 0,
            "beds_occupied" => $conn->query("SELECT COUNT(*) as count FROM beds WHERE status='occupied'")->fetch_assoc()['count'] ?? 0,
            "today_admissions" => $conn->query("SELECT COUNT(*) as count FROM admissions WHERE DATE(admission_date) = CURDATE()")->fetch_assoc()['count'] ?? 0,
            "pending_tests" => $conn->query("SELECT COUNT(*) as count FROM lab_tests WHERE status='pending'")->fetch_assoc()['count'] ?? 0,
            
            "recent_activity" => $logs,
            "alerts" => []
        );

        // Fetch recent fraud alerts
        $alerts_query = "SELECT * FROM fraud_alerts ORDER BY created_at DESC LIMIT 5";
        $alerts_result = $conn->query($alerts_query);
        while ($row = $alerts_result->fetch_assoc()) {
            array_push($stats['alerts'], $row);
        }

        // Add dynamic system alerts
        $total_beds = $stats['beds_available'] + $stats['beds_occupied'];
        if ($total_beds > 0) {
            $occupancy_rate = $stats['beds_occupied'] / $total_beds;
            if ($occupancy_rate > 0.8) {
                 array_unshift($stats['alerts'], [
                    'alert_type' => 'High Bed Occupancy',
                    'description' => 'Hospital bed occupancy is at ' . round($occupancy_rate * 100) . '%.',
                    'created_at' => date('Y-m-d H:i:s')
                 ]);
            }
        }

        echo json_encode($stats);
    }
    elseif ($action === 'audit_logs') {
        $logger = new Logger($conn);
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
        $logs_result = $logger->getRecentLogs($limit);
        $logs = array();
        while ($row = $logs_result->fetch_assoc()) {
            array_push($logs, $row);
        }
        echo json_encode($logs);
    }
    elseif ($action === 'export_data') {
        $type = isset($_GET['type']) ? $_GET['type'] : 'patients';
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $type . '_export_' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        if ($type === 'patients') {
            fputcsv($output, array('ID', 'Name', 'Email', 'Role', 'Created At'));
            $query = "SELECT user_id, full_name, email, role, created_at FROM users WHERE role='patient'";
            $result = $conn->query($query);
            while ($row = $result->fetch_assoc()) {
                fputcsv($output, $row);
            }
        } elseif ($type === 'logs') {
            fputcsv($output, array('ID', 'User ID', 'Action', 'Details', 'IP', 'Timestamp'));
            $query = "SELECT log_id, user_id, action, details, ip_address, created_at FROM audit_logs";
            $result = $conn->query($query);
            while ($row = $result->fetch_assoc()) {
                fputcsv($output, $row);
            }
        }
        fclose($output);
        exit();
    }
}
?>
