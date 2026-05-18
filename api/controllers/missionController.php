<?php
class MissionController
{
    private $db;
    private $table = "missions";

    public function __construct($databaseConnection)
    {
        $this->db = $databaseConnection;
    }

    public function getAllMissions()
    {
        // Now selecting m.date_range directly from the database table
        $query = "SELECT 
                    m.id, 
                    m.title, 
                    m.description AS requirement, 
                    m.points_reward AS xp_reward,
                    m.status, 
                    m.date_range, 
                    r.name AS assigned_route
                  FROM " . $this->table . " m
                  LEFT JOIN routes r ON m.route_id = r.id
                  ORDER BY m.id DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateMission($id, $data)
    {
        $query = "UPDATE " . $this->table . " 
                  SET title = :title, 
                      description = :requirement, 
                      points_reward = :xp_reward, 
                      status = :status, 
                      date_range = :date_range 
                  WHERE id = :id";

        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':requirement', $data['requirement']);
        $stmt->bindParam(':xp_reward', $data['xp_reward'], PDO::PARAM_INT);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':date_range', $data['date_range']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Mission updated successfully."];
        }
        return ["success" => false, "message" => "Failed to update mission."];
    }

    public function deleteMission($id)
    {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Mission deleted successfully."];
        }
        return ["success" => false, "message" => "Failed to delete mission."];
    }

    public function createMission($data)
    {
        // Validate required fields
        if (empty($data['title']) || empty($data['requirement'])) {
            return ["success" => false, "message" => "Title and Requirement are required fields."];
        }

        // fallback values if fields aren't supplied
        $status = $data['status'] ?? 'Active';
        $dateRange = $data['date_range'] ?? 'Oct 12 - Oct 14';
        $xpReward = isset($data['xp_reward']) ? intval($data['xp_reward']) : 0;
        $routeId = isset($data['route_id']) ? intval($data['route_id']) : null;

        $query = "INSERT INTO " . $this->table . " (title, description, points_reward, status, date_range, route_id) 
              VALUES (:title, :requirement, :xp_reward, :status, :date_range, :route_id)";

        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':requirement', $data['requirement']);
        $stmt->bindParam(':xp_reward', $xpReward, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':date_range', $dateRange);

        if ($routeId !== null) {
            $stmt->bindParam(':route_id', $routeId, PDO::PARAM_INT);
        } else {
            $stmt->bindValue(':route_id', null, PDO::PARAM_NULL);
        }

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Mission created successfully."];
        }
        return ["success" => false, "message" => "Failed to create mission table entry."];
    }
}