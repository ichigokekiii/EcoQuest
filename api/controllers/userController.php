<?php

class UserController
{
    private $conn;

    public function __construct($dbConnection)
    {
        $this->conn = $dbConnection;
    }

    // 1. Update this method to grab all users along with role and status
    public function getAllUsers()
    {
        try {
            // Added role and status to the SELECT statement
            $query = "SELECT id, username, email, role, status, points, created_at FROM users ORDER BY points DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ["error" => "Failed to fetch users: " . $e->getMessage()];
        }
    }

    // 2. Update this method for single-user view details if needed
    public function getUserProfile($id)
    {
        try {
            // Added role and status here as well
            $query = "SELECT id, username, email, role, status, points, created_at FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ? $user : ["message" => "User not found."];
        } catch (PDOException $e) {
            return ["error" => "Database error: " . $e->getMessage()];
        }
    }

    // 3. Update registration default assignments if you handle signups here
    public function registerUser($data)
    {
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return ["success" => false, "message" => "Incomplete form details."];
        }

        try {
            // Explicitly set default state fields on creation if desired
            $query = "INSERT INTO users (username, email, password_hash, role, status, points) 
                      VALUES (:username, :email, :password_hash, 'User', 'Active', 0)";

            $stmt = $this->conn->prepare($query);
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':password_hash', $hashedPassword);

            if ($stmt->execute()) {
                return ["success" => true, "message" => "User registered successfully."];
            }
            return ["success" => false, "message" => "Registration execution failed."];
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database error: " . $e->getMessage()];
        }
    }
}