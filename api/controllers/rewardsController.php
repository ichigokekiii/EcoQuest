<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class RewardsController
{
    private $db;
    private $uploadDir = __DIR__ . '/../../public/rewards/';

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    /**
     * Helper to handle file uploads safely
     */
    private function handleImageUpload()
    {
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            if (!is_dir($this->uploadDir)) {
                mkdir($this->uploadDir, 0777, true);
            }

            $fileExtension = pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION);
            // Create a clean, unique name to prevent overwrites
            $newFileName = uniqid('reward_', true) . '.' . $fileExtension;
            $targetFilePath = $this->uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetFilePath)) {
                return $newFileName;
            }
        }
        return null;
    }

    /**
     * 📥 FETCH ALL REWARDS (GET)
     */
    public function getAllRewards()
    {
        try {
            $query = "SELECT id, title, category, points_required, stock_level, image_url, is_featured, status, created_at FROM rewards ORDER BY id DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $rewards = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rewards as &$reward) {
                $reward['id'] = (int) $reward['id'];
                $reward['points_required'] = (int) $reward['points_required'];
                $reward['stock_level'] = ($reward['stock_level'] === null) ? null : (int) $reward['stock_level'];
                $reward['is_featured'] = (int) $reward['is_featured'];
            }

            http_response_code(200);
            echo json_encode($rewards);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }

    /**
     * 📤 CREATE NEW REWARD (POST)
     */
    public function createReward()
    {
        try {
            // Read standard multipart form data parameters
            if (empty($_POST['title']) || empty($_POST['category']) || !isset($_POST['points_required'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing required properties."]);
                return;
            }

            $title = strip_tags($_POST['title']);
            $category = $_POST['category'];
            $points_required = (int) $_POST['points_required'];
            $stock_level = ($_POST['stock_level'] === null || $_POST['stock_level'] === "") ? null : (int) $_POST['stock_level'];
            $is_featured = isset($_POST['is_featured']) ? (int) $_POST['is_featured'] : 0;
            $status = ($stock_level !== null && $stock_level <= 0) ? 'Inactive' : 'Active';

            // Check if a file was uploaded, otherwise fall back to string text URL or default
            $uploadedFile = $this->handleImageUpload();
            $image_url = $uploadedFile ? $uploadedFile : (!empty($_POST['image_url']) ? $_POST['image_url'] : 'default-reward.png');

            $query = "INSERT INTO rewards (title, category, points_required, stock_level, image_url, is_featured, status) 
                      VALUES (:title, :category, :points_required, :stock_level, :image_url, :is_featured, :status)";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':points_required', $points_required);
            $stmt->bindValue(':stock_level', $stock_level, $stock_level === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_INT);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "New reward catalog item added."]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to write row database entry."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
        }
    }

    /**
     * 🛠️ UPDATE EXISTING REWARD CARD (POST fallback for multipart parsing compatibility)
     * Handles: http://localhost/EcoQuest/api/index.php?endpoint=rewards&id={id}
     */
    public function updateReward($id)
    {
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing identification ID."]);
                return;
            }

            // Read parameters out of global POST space
            $title = strip_tags($_POST['title']);
            $category = $_POST['category'];
            $points_required = (int) $_POST['points_required'];
            $stock_level = ($_POST['stock_level'] === null || $_POST['stock_level'] === "") ? null : (int) $_POST['stock_level'];
            $is_featured = (int) $_POST['is_featured'];
            $status = ($stock_level !== null && $stock_level <= 0) ? 'Inactive' : $_POST['status'];

            // Handle optional image file updates
            $uploadedFile = $this->handleImageUpload();

            if ($uploadedFile) {
                $query = "UPDATE rewards SET title = :title, category = :category, points_required = :points_required, 
                             stock_level = :stock_level, image_url = :image_url, is_featured = :is_featured, status = :status 
                          WHERE id = :id";
            } else {
                $query = "UPDATE rewards SET title = :title, category = :category, points_required = :points_required, 
                             stock_level = :stock_level, is_featured = :is_featured, status = :status 
                          WHERE id = :id";
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':points_required', $points_required);
            $stmt->bindValue(':stock_level', $stock_level, $stock_level === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_INT);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($uploadedFile) {
                $stmt->bindParam(':image_url', $uploadedFile);
            }

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Reward row record entry modified."]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to update record changes."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error routing execution: " . $e->getMessage()]);
        }
    }
}