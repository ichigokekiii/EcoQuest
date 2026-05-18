<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests gracefully
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class RewardsController
{
    private $db;

    // Expects a PDO instance passed from your main api/index.php entry point
    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    /**
     * 📥 FETCH ALL REWARDS (GET)
     * Handles: http://localhost/EcoQuest/api/index.php?endpoint=rewards
     */
    public function getAllRewards()
    {
        try {
            $query = "SELECT id, title, category, points_required, stock_level, image_url, is_featured, status, created_at FROM rewards ORDER BY id DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $rewards = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Map types safely before delivering to React JSON parsing engine
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
     * Handles submission data coming from the inline dashboard placeholder card
     */
    public function createReward()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['title']) || empty($data['category']) || !isset($data['points_required'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing required properties (title, category, or points)."]);
                return;
            }

            // Extract variables with structural fail-safes
            $title = strip_tags($data['title']);
            $category = $data['category'];
            $points_required = (int) $data['points_required'];

            // Explicitly map empty values or "Unlimited" text strings directly to a true database NULL value
            $stock_level = ($data['stock_level'] === null || $data['stock_level'] === "") ? null : (int) $data['stock_level'];
            $is_featured = isset($data['is_featured']) ? (int) $data['is_featured'] : 0;

            // Compute status context dynamically based on stock volume metrics
            $status = ($stock_level !== null && $stock_level <= 0) ? 'Inactive' : 'Active';
            $image_url = isset($data['image_url']) ? $data['image_url'] : 'default-reward.png';

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
                echo json_encode(["success" => true, "message" => "New reward catalog item added.", "id" => $this->db->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to write row database entry record."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error processing payload: " . $e->getMessage()]);
        }
    }

    /**
     * 🛠️ UPDATE EXISTING REWARD CARD (PUT)
     * Handles: http://localhost/EcoQuest/api/index.php?endpoint=rewards&id={id}
     */
    public function updateReward($id)
    {
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing entry identification row id."]);
                return;
            }

            $data = json_decode(file_get_contents("php://input"), true);

            $title = strip_tags($data['title']);
            $category = $data['category'];
            $points_required = (int) $data['points_required'];
            $stock_level = ($data['stock_level'] === null || $data['stock_level'] === "") ? null : (int) $data['stock_level'];
            $is_featured = (int) $data['is_featured'];

            // Automatic stock status fallback override guard logic
            $status = ($stock_level !== null && $stock_level <= 0) ? 'Inactive' : $data['status'];

            $query = "UPDATE rewards SET 
                        title = :title, 
                        category = :category, 
                        points_required = :points_required, 
                        stock_level = :stock_level, 
                        is_featured = :is_featured, 
                        status = :status 
                      WHERE id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':category', $category);
            $stmt->bindParam(':points_required', $points_required);
            $stmt->bindValue(':stock_level', $stock_level, $stock_level === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_INT);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Reward row record entry modified inside database."]);
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