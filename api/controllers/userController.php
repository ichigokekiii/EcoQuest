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
    // 4. Update an existing user's details (PUT)
    // 4. Update an existing user's details safely (PUT)
    public function updateUser($id, $data)
    {
        if (empty($id)) {
            return ["success" => false, "message" => "Missing user ID for update."];
        }

        try {
            $query = "UPDATE users 
                      SET username = :username, 
                          email = :email, 
                          role = :role, 
                          status = :status, 
                          points = :points 
                      WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // 🛠️ FIX: Assign raw values to variables with safe fallbacks first.
            // This prevents PHP Notices if keys are missing from the incoming request payload.
            $username = $data['username'] ?? '';
            $email = $data['email'] ?? '';
            $role = $data['role'] ?? 'User';
            $status = $data['status'] ?? 'Active';
            $points = isset($data['points']) ? (int) $data['points'] : 0;

            // Bind parameters securely using the safe local variables
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':points', $points, PDO::PARAM_INT);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return ["success" => true, "message" => "User updated successfully."];
            }
            return ["success" => false, "message" => "No rows were updated or execution failed."];
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database error: " . $e->getMessage()];
        }
    }

    // 5. Delete a user from the system (DELETE)
    public function deleteUser($id)
    {
        if (empty($id)) {
            return ["success" => false, "message" => "Missing user ID for deletion."];
        }

        try {
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return ["success" => true, "message" => "User deleted successfully."];
            }
            return ["success" => false, "message" => "Failed to delete user."];
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database error: " . $e->getMessage()];
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