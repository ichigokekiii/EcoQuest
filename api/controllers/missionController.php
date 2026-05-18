<?php
class MissionController
{
    private $db;
    private $table = "missions";

    public function __construct($databaseConnection)
    {
        $this->db = $databaseConnection;
    }

    // Fetch ALL missions with joined route details for the dashboard cards
    public function getAllMissions()
    {
        // Replaced 'Active' AS status with the actual m.status column
        $query = "SELECT 
                m.id, 
                m.title, 
                m.description AS requirement, 
                m.points_reward AS xp_reward,
                m.status, 
                'Oct 12 - Oct 14' AS date_range, 
                r.name AS assigned_route
              FROM " . $this->table . " m
              LEFT JOIN routes r ON m.route_id = r.id
              ORDER BY m.id DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}