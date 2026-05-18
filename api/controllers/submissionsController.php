<?php
class SubmissionsController
{
    private $db;

    public function __construct($dbConnection)
    {
        $this->db = $dbConnection;
    }

    // GET: Fetch all submissions with user and route details
    public function getAllSubmissions()
    {
        try {
            // Fixed r.title to r.name to match database definition schema
            $query = "SELECT ts.*, u.username, r.name AS route_title 
                      FROM trash_submissions ts
                      INNER JOIN users u ON ts.user_id = u.id
                      LEFT JOIN routes r ON ts.route_id = r.id
                      ORDER BY ts.created_at DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($result);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to fetch submissions: " . $e->getMessage()]);
        }
    }

    // POST: Update submission status and award points if approved
    public function updateStatus($id, $status)
    {
        if (!in_array($status, ['Approved', 'Rejected', 'Pending'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid status value."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            $checkQuery = "SELECT status, user_id, trash_category FROM trash_submissions WHERE id = :id";
            $stmt = $this->db->prepare($checkQuery);
            $stmt->execute([':id' => $id]);
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$submission) {
                $this->db->rollBack();
                http_response_code(404);
                echo json_encode(["error" => "Submission not found."]);
                return;
            }

            if ($submission['status'] === $status) {
                $this->db->rollBack();
                echo json_encode(["success" => true, "message" => "Submission is already set to $status."]);
                return;
            }

            // Update the status of the submission
            $updateQuery = "UPDATE trash_submissions SET status = :status, updated_at = CURRENT_TIMESTAMP() WHERE id = :id";
            $stmt = $this->db->prepare($updateQuery);
            $stmt->execute([
                ':status' => $status,
                ':id' => $id
            ]);

            // Clean string tracking parameters securely
            $categoryLower = strtolower(trim($submission['trash_category']));

            // Use pattern matching to find sub-strings within descriptive schema items safely
            $pointsCalculated = 500; // Default baseline reward for plastics/others
            if (strpos($categoryLower, 'can') !== false) {
                $pointsCalculated = 300;
            } elseif (strpos($categoryLower, 'cardboard') !== false || strpos($categoryLower, 'paper') !== false) {
                $pointsCalculated = 400;
            }

            // Award points if status is changing to 'Approved'
            if ($status === 'Approved' && $submission['status'] !== 'Approved') {
                $pointsQuery = "UPDATE users SET points = points + :points WHERE id = :user_id";
                $stmt = $this->db->prepare($pointsQuery);
                $stmt->execute([
                    ':points' => $pointsCalculated,
                    ':user_id' => $submission['user_id']
                ]);
            }

            // Deduct points if an Approved item is rolled back to Rejected or Pending
            if (($status === 'Rejected' || $status === 'Pending') && $submission['status'] === 'Approved') {
                $pointsQuery = "UPDATE users SET points = GREATEST(0, points - :points) WHERE id = :user_id";
                $stmt = $this->db->prepare($pointsQuery);
                $stmt->execute([
                    ':points' => $pointsCalculated,
                    ':user_id' => $submission['user_id']
                ]);
            }

            $this->db->commit();
            echo json_encode(["success" => true, "message" => "Submission status updated to $status successfully.", "points_adjusted" => $pointsCalculated]);

        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Database mutation failed: " . $e->getMessage()]);
        }
    }
}