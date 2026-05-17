<?php
// Essential CORS Headers for Vite/React applications
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Exit immediately on preflight requests
}

require_once './config/DatabaseConnection.php';
require_once './controllers/UserController.php';

$database = new DatabaseConnection();
$dbConn = $database->getConnection();

// Parse requests like api/index.php?endpoint=users
$endpoint = $_GET['endpoint'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($endpoint) {
    case 'users':
        $controller = new UserController($dbConn);

        if ($requestMethod === 'GET') {
            if (isset($_GET['id'])) {
                // e.g., api/index.php?endpoint=users&id=1 (Single user view)
                echo json_encode($controller->getUserProfile($_GET['id']));
            } else {
                // e.g., api/index.php?endpoint=users (All users table)
                echo json_encode($controller->getAllUsers());
            }
        } elseif ($requestMethod === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($controller->registerUser($data));
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found."]);
        break;
}