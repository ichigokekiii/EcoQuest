<?php
// Enable CORS headers so React can talk to PHP without security blocks
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests gracefully
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Ensure error reporting doesn't inject raw markup strings into your json stream!
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Load required configs and controllers
require_once './config/DatabaseConnection.php';
require_once './controllers/UserController.php';
require_once './controllers/MissionController.php'; // Added Mission Controller inclusion

$database = new DatabaseConnection();
$dbConn = $database->getConnection();

// Instantiate Controllers
$userController = new UserController($dbConn);
$missionController = new MissionController($dbConn); // Added Mission Controller instance

$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Explicitly cast ID parameters to integers safely or null
$id = isset($_GET['id']) && $_GET['id'] !== '' ? intval($_GET['id']) : null;

// ==========================================
// ENDPOINT ROUTING MATRIX
// ==========================================

if ($endpoint === 'users') {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                echo json_encode($userController->getUserProfile($id));
            } else {
                echo json_encode($userController->getAllUsers());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($userController->registerUser($data));
            break;

        case 'PUT':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);

            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing user ID query parameter."]);
                break;
            }

            if (!$data) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing or malformed JSON body payload."]);
                break;
            }

            echo json_encode($userController->updateUser($id, $data));
            break;

        case 'DELETE':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing user ID for deletion."]);
                break;
            }
            echo json_encode($userController->deleteUser($id));
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
            break;
    }
}
// 🛠️ Added Handler Block for the EcoQuest Missions Endpoint
elseif ($endpoint === 'missions') {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                // If you build a single mission lookup method later
                if (method_exists($missionController, 'getMissionDetails')) {
                    echo json_encode($missionController->getMissionDetails($id));
                } else {
                    echo json_encode(["message" => "Single mission view not implemented yet."]);
                }
            } else {
                // This calls your dynamic SQL statement that joins the routes table
                echo json_encode($missionController->getAllMissions());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (method_exists($missionController, 'createMission')) {
                echo json_encode($missionController->createMission($data));
            } else {
                echo json_encode(["message" => "Create action not implemented yet."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found."]);
}