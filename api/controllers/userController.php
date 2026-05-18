<?php

class UserController
{
    private $db;
    private $uploadDir = __DIR__ . '/../../public/users/';

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    /**
     * Helper to process profile image uploads securely
     */
    private function handleUserImageUpload()
    {
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            if (!is_dir($this->uploadDir)) {
                mkdir($this->uploadDir, 0777, true);
            }

            $fileExtension = pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION);
            // Generates a random unguessable unique string to prevent naming conflicts
            $newFileName = uniqid('user_', true) . '.' . $fileExtension;
            $targetFilePath = $this->uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetFilePath)) {
                return $newFileName;
            }
        }
        return null;
    }

    /**
     * FETCH ALL USERS (GET)
     * Directly echoes response internally to match your api/index.php structure
     */
    public function getAllUsers()
    {
        try {
            $query = "SELECT id, username, email, role, status, points, image_url, created_at FROM users ORDER BY id DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Cast native variable types properly
            foreach ($users as &$user) {
                $user['id'] = (int) $user['id'];
                $user['points'] = (int) $user['points'];
            }

            http_response_code(200);
            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database fetch error: " . $e->getMessage()]);
        }
    }

    /**
     * GET SINGLE USER PROFILE (GET with ?id=x)
     */
    public function getUserProfile($id)
    {
        try {
            $query = "SELECT id, username, email, role, status, points, image_url FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $user['id'] = (int) $user['id'];
                $user['points'] = (int) $user['points'];
                return $user; // Returns structure matching wrapper in api/index.php
            }

            http_response_code(404);
            return ["success" => false, "message" => "User account matching tracking values not found."];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    /**
     * ADD / REGISTER NEW USER (POST)
     */
    public function addUser()
    {
        try {
            if (empty($_POST['username']) || empty($_POST['email']) || empty($_POST['password'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing required fields (username, email, or password)."]);
                return;
            }

            $username = strip_tags($_POST['username']);
            $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
            $password_hash = password_hash($_POST['password'], PASSWORD_BCRYPT);
            $role = !empty($_POST['role']) ? $_POST['role'] : 'User';
            $status = !empty($_POST['status']) ? $_POST['status'] : 'Active';
            $points = isset($_POST['points']) ? (int) $_POST['points'] : 0;

            if (!$email) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Invalid email validation format parameters."]);
                return;
            }

            // Check file upload or fallback to standard placeholder string values
            $uploadedFile = $this->handleUserImageUpload();
            $image_url = $uploadedFile ? $uploadedFile : (!empty($_POST['image_url']) ? $_POST['image_url'] : 'default-user.png');

            $query = "INSERT INTO users (username, email, password_hash, role, status, points, image_url) 
                      VALUES (:username, :email, :password_hash, :role, :status, :points, :image_url)";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password_hash', $password_hash);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':points', $points, PDO::PARAM_INT);
            $stmt->bindParam(':image_url', $image_url);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "User account registered successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to write user row metrics."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
        }
    }

    /**
     * UPDATE EXISTING USER ACCOUNT DETAILS (POST with id redirect fallback)
     */
    public function updateUser($id)
    {
        try {
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Missing core identification variable reference query key."]);
                return;
            }

            $username = strip_tags($_POST['username']);
            $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
            $role = $_POST['role'];
            $status = $_POST['status'];
            $points = (int) $_POST['points'];

            $uploadedFile = $this->handleUserImageUpload();

            // Form dynamic sql query based on whether we are overwriting the profile image file field mapping values
            if ($uploadedFile) {
                $query = "UPDATE users SET username = :username, email = :email, role = :role, status = :status, points = :points, image_url = :image_url WHERE id = :id";
            } else {
                $query = "UPDATE users SET username = :username, email = :email, role = :role, status = :status, points = :points WHERE id = :id";
            }

            // Optional branch check execution if password payload modification values are supplied
            if (!empty($_POST['password'])) {
                if ($uploadedFile) {
                    $query = "UPDATE users SET username = :username, email = :email, password_hash = :password_hash, role = :role, status = :status, points = :points, image_url = :image_url WHERE id = :id";
                } else {
                    $query = "UPDATE users SET username = :username, email = :email, password_hash = :password_hash, role = :role, status = :status, points = :points WHERE id = :id";
                }
            }

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':points', $points, PDO::PARAM_INT);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if (!empty($_POST['password'])) {
                $newHash = password_hash($_POST['password'], PASSWORD_BCRYPT);
                $stmt->bindParam(':password_hash', $newHash);
            }

            if ($uploadedFile) {
                $stmt->bindParam(':image_url', $uploadedFile);
            }

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "User account updated successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to execute changes on target database record rows."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "System execution error: " . $e->getMessage()]);
        }
    }

    /**
     * DELETE EXISTING USER ACCOUNT RECORD
     */
    public function deleteUser($id)
    {
        try {
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return ["success" => true, "message" => "User record completely eradicated."];
            }
            return ["success" => false, "message" => "Failed to purge database row data values."];
        } catch (PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }
}