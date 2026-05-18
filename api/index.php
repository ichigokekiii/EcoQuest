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

// ... (Your database connection setup goes here: $dbConnection) ...

require_once './config/DatabaseConnection.php';
require_once './controllers/UserController.php';

$database = new DatabaseConnection();
$dbConn = $database->getConnection();
$controller = new UserController($dbConn);

$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// 🛠️ CRITICAL FIX: Explicitly cast ID parameters to integers safely or null
$id = isset($_GET['id']) && $_GET['id'] !== '' ? intval($_GET['id']) : null;

if ($endpoint === 'users') {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                echo json_encode($controller->getUserProfile($id));
            } else {
                echo json_encode($controller->getAllUsers());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($controller->registerUser($data));
            break;

        case 'PUT':
            // Read raw input payload sent by React safely
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);

            // 🛠️ Guard rails: Verify data structures exist before passing to UserController
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

            // Run the controller save method safely
            echo json_encode($controller->updateUser($id, $data));
            break;

        case 'DELETE':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing user ID for deletion."]);
                break;
            }
            echo json_encode($controller->deleteUser($id));
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