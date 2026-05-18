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
require_once './controllers/MissionController.php';
require_once './controllers/RouteController.php';
require_once './controllers/RewardsController.php';
require_once './controllers/SubmissionsController.php';

$database = new DatabaseConnection();
$dbConn = $database->getConnection();

// Instantiate Controllers
$userController = new UserController($dbConn);
$routeController = new RouteController($dbConn);
$missionController = new MissionController($dbConn);
$rewardController = new RewardsController($dbConn);
$submissionsController = new SubmissionsController($dbConn);

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
                $userController->getAllUsers();
            }
            break;

        case 'POST':
            if ($id !== null) {
                $userController->updateUser($id);
            } else {
                $userController->addUser();
            }
            break;

        case 'PUT':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);

            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing user ID query parameter."]);
                break;
            }
            $userController->updateUser($id);
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
//  Handler Block for the EcoQuest Missions Endpoint
elseif ($endpoint === 'missions') {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                if (method_exists($missionController, 'getMissionDetails')) {
                    echo json_encode($missionController->getMissionDetails($id));
                } else {
                    echo json_encode(["message" => "Single mission view not implemented yet."]);
                }
            } else {
                echo json_encode($missionController->getAllMissions());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($missionController->createMission($data));
            break;

        case 'PUT':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);

            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing mission ID query parameter."]);
                break;
            }

            if (!$data) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing or malformed JSON body payload."]);
                break;
            }

            echo json_encode($missionController->updateMission($id, $data));
            break;

        case 'DELETE':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing mission ID for deletion."]);
                break;
            }
            echo json_encode($missionController->deleteMission($id));
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
            break;
    }
}
// Handler Block for EcoQuest Routes Endpoint
elseif ($endpoint === 'routes') {
    switch ($method) {
        case 'GET':
            if ($id !== null) {
                echo json_encode($routeController->getRouteDetails($id));
            } else {
                echo json_encode($routeController->getAllRoutes());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            echo json_encode($routeController->createRoute($data));
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing identification parameter key."]);
                break;
            }
            echo json_encode($routeController->updateRoute($id, $data));
            break;

        case 'DELETE':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing Route ID Query Key."]);
                break;
            }
            echo json_encode($routeController->deleteRoute($id));
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method Not Allowed"]);
            break;
    }
}
// Gateway Router Logic Array for Rewards Endpoint
elseif ($endpoint === 'rewards') {
    switch ($method) {
        case 'GET':
            $rewardController->getAllRewards();
            break;

        case 'POST':
            if ($id !== null) {
                $rewardController->updateReward($id);
            } else {
                $rewardController->createReward();
            }
            break;

        case 'PUT':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing reward ID parameter key."]);
                break;
            }
            $rewardController->updateReward($id);
            break;

        // 🌟 ADDED DELETE CASE BLOCK TO HANDLE DELETIONS
        case 'DELETE':
            if ($id === null) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Bad Request: Missing reward ID for deletion."]);
                break;
            }
            $rewardController->deleteReward($id);
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "HTTP Request Method handling not permitted."]);
            break;
    }
}
// Handler Block for Trash Submissions Verification Endpoint
elseif ($endpoint === 'submissions') {
    switch ($method) {
        case 'GET':
            $submissionsController->getAllSubmissions();
            break;

        case 'POST':
            $status = $_POST['status'] ?? null;

            if ($id && $status) {
                $submissionsController->updateStatus($id, $status);
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing submission ID parameter or status data value."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "HTTP Request Method handling not permitted on submissions endpoint."]);
            break;
    }

} elseif ($endpoint === 'notifications-count') {
    if ($method === 'GET') {
        try {
            // Re-using the $dbConn instance instantiated at the top of your index file
            $stmt = $dbConn->query("SELECT COUNT(*) as total FROM trash_submissions WHERE status = 'Pending'");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "count" => (int) $result['total']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to fetch notification counts: " . $e->getMessage()]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Method Not Allowed for notification checks."]);
    }
}

// Final fallback wrapper logic (Keep this exactly as you had it)
else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found."]);
}