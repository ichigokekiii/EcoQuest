<?php
class UserController
{
    private $db;
    private $table = "users";

    public function __construct($databaseConnection)
    {
        $this->db = $databaseConnection;
    }

    // Fetch ALL users 
    public function getAllUsers()
    {
        // Selects key dashboard columns from your ecoquest schema tables
        $query = "SELECT id, username, email, points FROM " . $this->table . " ORDER BY points DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single user profile by ID
    public function getUserProfile($id)
    {
        $query = "SELECT id, username, email, points, created_at 
                  FROM " . $this->table . " 
                  WHERE id = :id LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $stmt->fetch();
        }
        return ["message" => "User not found."];
    }
}