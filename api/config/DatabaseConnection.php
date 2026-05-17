<?php
class DatabaseConnection
{
    private $host = "localhost";
    private $db_name = "ecoquest";  // 1. Must match the exact name created in phpMyAdmin
    private $username = "root";     // 2. Default XAMPP username is always 'root'
    private $password = "";         // 3. Default XAMPP password is an EMPTY string ''
    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            // Ensure no spaces are missing inside the DSN string
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            // Formats error as valid JSON so React does not crash with unexpected tokens
            header("Content-Type: application/json");
            http_response_code(500);
            echo json_encode([
                "error" => "Database connection failed",
                "details" => $exception->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}