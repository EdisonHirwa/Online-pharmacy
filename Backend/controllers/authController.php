<?php
// controllers/authController.php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/connection.php';
include_once '../models/User.php';
include_once '../models/Logger.php';
include_once '../includes/FraudDetector.php';

$logger = new Logger($conn);
$fraudDetector = new FraudDetector($conn);

// Debug logging
function logDebug($message) {
    file_put_contents('../logs/debug.log', date('[Y-m-d H:i:s] ') . $message . PHP_EOL, FILE_APPEND);
}

// Ensure logs directory exists
if (!file_exists('../logs')) {
    mkdir('../logs', 0777, true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user = new User($conn);

if ($method === 'POST') {
    $raw_input = file_get_contents("php://input");
    logDebug("Raw Input: " . $raw_input);
    
    $data = json_decode($raw_input);
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'register') {
        logDebug("Register attempt");
        if(
            !empty($data->full_name) &&
            !empty($data->email) &&
            !empty($data->password) &&
            !empty($data->role)
        ) {
            $user->full_name = $data->full_name;
            $user->email = $data->email;
            $user->password = $data->password;
            $user->role = $data->role;
            $user->phone = isset($data->phone) ? $data->phone : '';
            $user->address = isset($data->address) ? $data->address : '';

            if($user->emailExists()) {
                http_response_code(400);
                echo json_encode(array("message" => "Email already exists."));
            } else {
                // Fraud Check
                $fraudDetector->detectDuplicateAccounts($user->email, $_SERVER['REMOTE_ADDR']);

                if($user->register()) {
                    $logger->log($user->user_id, 'REGISTER', "New user registered: $user->email");
                    http_response_code(201);
                    echo json_encode(array("message" => "User registered successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to register user."));
                }
            }
        } else {
            logDebug("Incomplete data for register: " . print_r($data, true));
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data. Required: full_name, email, password, role."));
        }
    } 
    elseif ($action === 'login') {
        logDebug("Login attempt for: " . (isset($data->email) ? $data->email : 'unknown'));
        if(!empty($data->email) && !empty($data->password)) {
            $user->email = $data->email;
            $user->password = $data->password;

            if($user->login()) {
                $_SESSION['user_id'] = $user->user_id;
                $_SESSION['role'] = $user->role;
                $_SESSION['full_name'] = $user->full_name;
                
                $logger->log($user->user_id, 'LOGIN', 'User logged in');

                http_response_code(200);
                echo json_encode(array(
                    "message" => "Login successful.",
                    "user" => array(
                        "id" => $user->user_id,
                        "name" => $user->full_name,
                        "role" => $user->role
                    )
                ));
            } else {
                $logger->log($user->user_id ?? 0, 'FAILED_LOGIN', "Failed login attempt for " . $data->email);
                http_response_code(401);
                echo json_encode(array("message" => "Invalid credentials."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    }
    elseif ($action === 'logout') {
        session_destroy();
        http_response_code(200);
        echo json_encode(array("message" => "Logged out successfully."));
    }
    elseif ($action === 'update_profile') {
        if(isset($_SESSION['user_id'])) {
            $query = "UPDATE users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sssi", $data->full_name, $data->phone, $data->address, $_SESSION['user_id']);
            
            if($stmt->execute()) {
                $logger->log($_SESSION['user_id'], 'UPDATE_PROFILE', 'User updated profile');
                echo json_encode(array("message" => "Profile updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update profile."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized. Please log in."));
        }
    }
}
elseif ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if ($action === 'check_session') {
        if(isset($_SESSION['user_id'])) {
            http_response_code(200);
            echo json_encode(array(
                "isLoggedIn" => true,
                "user" => array(
                    "id" => $_SESSION['user_id'],
                    "role" => $_SESSION['role'],
                    "name" => $_SESSION['full_name']
                )
            ));
        } else {
            http_response_code(200); 
            echo json_encode(array("isLoggedIn" => false));
        }
    }
    elseif ($action === 'profile') {
        if(isset($_SESSION['user_id'])) {
            $user->user_id = $_SESSION['user_id'];
            // We need a method to get user details by ID in User model
            // Let's add it or use a query here
            $query = "SELECT full_name, email, phone, address FROM users WHERE user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $user->user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                http_response_code(200);
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "User profile not found."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized. Please log in."));
        }
    }
}
?>
