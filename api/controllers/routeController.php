<?php
class RouteController
{
    private $db;
    private $table = "routes";

    public function __construct($databaseConnection)
    {
        $this->db = $databaseConnection;
    }

    // ==========================================
    // 1. READ ALL ROUTES (GET)
    // ==========================================
    public function getAllRoutes()
    {
        $query = "SELECT 
                    id, 
                    name, 
                    description, 
                    region, 
                    difficulty, 
                    distance, 
                    est_time, 
                    trash_spots, 
                    status,
                    created_at,
                    updated_at
                  FROM " . $this->table . " 
                  ORDER BY id DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================================
    // 2. READ SINGLE ROUTE DETAILS (GET with ?id=)
    // ==========================================
    public function getRouteDetails($id)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 0,1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }

        http_response_code(404);
        return ["success" => false, "message" => "Route not found."];
    }

    // ==========================================
    // 3. CREATE NEW ROUTE (POST)
    // ==========================================
    public function createRoute($data)
    {
        if (empty($data['name'])) {
            http_response_code(400);
            return ["success" => false, "message" => "Bad Request: Route Name is required."];
        }

        $query = "INSERT INTO " . $this->table . " 
                    (name, description, region, difficulty, distance, est_time, trash_spots, status, created_at, updated_at) 
                  VALUES 
                    (:name, :description, :region, :difficulty, :distance, :est_time, :trash_spots, :status, NOW(), NOW())";

        $stmt = $this->db->prepare($query);

        // Sanitize values with fallbacks matching your dashboard schema defaults
        $description = $data['description'] ?? '';
        $region = $data['region'] ?? 'Manila, NCR';
        $difficulty = $data['difficulty'] ?? 'Easy';
        $distance = $data['distance'] ?? '1.2 km';
        $estTime = $data['est_time'] ?? '18 min';
        $trashSpots = $data['trash_spots'] ?? '0';
        $status = $data['status'] ?? 'Draft';

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':region', $region);
        $stmt->bindParam(':difficulty', $difficulty);
        $stmt->bindParam(':distance', $distance);
        $stmt->bindParam(':est_time', $estTime);
        $stmt->bindParam(':trash_spots', $trashSpots);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            return [
                "success" => true,
                "message" => "Route successfully logged into system database.",
                "inserted_id" => $this->db->lastInsertId()
            ];
        }
        return ["success" => false, "message" => "Database Execution Failure: Route could not be built."];
    }

    // ==========================================
    // 4. UPDATE EXISTING ROUTE (PUT)
    // ==========================================
    public function updateRoute($id, $data)
    {
        if (empty($data['name'])) {
            http_response_code(400);
            return ["success" => false, "message" => "Bad Request: Cannot clear route title parameters entirely."];
        }

        $query = "UPDATE " . $this->table . " 
                  SET name = :name, 
                      description = :description, 
                      region = :region, 
                      difficulty = :difficulty, 
                      distance = :distance, 
                      est_time = :est_time, 
                      trash_spots = :trash_spots, 
                      status = :status,
                      updated_at = NOW() 
                  WHERE id = :id";

        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':region', $data['region']);
        $stmt->bindParam(':difficulty', $data['difficulty']);
        $stmt->bindParam(':distance', $data['distance']);
        $stmt->bindParam(':est_time', $data['est_time']);
        $stmt->bindParam(':trash_spots', $data['trash_spots']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Route properties updated dynamically."];
        }
        return ["success" => false, "message" => "Failed to update selected route execution row."];
    }

    // ==========================================
    // 5. DELETE ROUTE RECORD (DELETE)
    // ==========================================
    public function deleteRoute($id)
    {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Route entry dropped from EcoQuest core metrics cleanly."];
        }
        return ["success" => false, "message" => "Critical Error: Removal thread failed."];
    }
}