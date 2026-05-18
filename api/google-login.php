<?php
// api/google-login.php
// Place this file at: C:\xampp\htdocs\api\google-login.php  (Windows)
//                 or: /Applications/XAMPP/htdocs/api/google-login.php (macOS)

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173"); // Vite dev server default
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Pre-flight CORS request — return early
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit;
}

// ─── Configuration ────────────────────────────────────────────────────────────
// Paste your Google OAuth Client ID here (from Google Cloud Console)
define("GOOGLE_CLIENT_ID", "867659400772-d9ju4b3f05iinuttu7ed358lk18jl3se.apps.googleusercontent.com");

// ─── Read & validate request body ────────────────────────────────────────────
$body = json_decode(file_get_contents("php://input"), true);

if (empty($body["token"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing token."]);
    exit;
}

$idToken = trim($body["token"]);

// ─── Verify the token with Google ─────────────────────────────────────────────
// Google's tokeninfo endpoint validates the JWT signature and expiry for you.
// For production, consider the Google API PHP Client library instead.
$verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($idToken);

$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlError || $httpStatus !== 200) {
    http_response_code(502);
    echo json_encode([
        "success" => false,
        "message" => "Could not reach Google verification servers.",
    ]);
    exit;
}

$googleData = json_decode($response, true);

// ─── Validate token claims ────────────────────────────────────────────────────
// 1. Audience must match your Client ID (prevents token reuse from other apps)
if (($googleData["aud"] ?? "") !== GOOGLE_CLIENT_ID) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Token audience mismatch."]);
    exit;
}

// 2. Token must not be expired (Google also checks this, but defense-in-depth)
if (($googleData["exp"] ?? 0) < time()) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Token has expired."]);
    exit;
}

// 3. Email must be verified by Google
if (($googleData["email_verified"] ?? "false") !== "true") {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Google email is not verified."]);
    exit;
}

// ─── Build user object from verified claims ───────────────────────────────────
$user = [
    "google_id" => $googleData["sub"],           // Stable, unique Google user ID
    "email" => $googleData["email"],
    "name" => $googleData["name"] ?? "",
    "picture" => $googleData["picture"] ?? "",
    "given_name" => $googleData["given_name"] ?? "",
    "family_name" => $googleData["family_name"] ?? "",
];

// ─── (Optional) Persist user to your database ────────────────────────────────
// Uncomment and adapt to your DB setup:
//
// $pdo = new PDO("mysql:host=localhost;dbname=your_db;charset=utf8mb4", "root", "");
// $stmt = $pdo->prepare("
//     INSERT INTO users (google_id, email, name, picture, created_at)
//     VALUES (:google_id, :email, :name, :picture, NOW())
//     ON DUPLICATE KEY UPDATE name = VALUES(name), picture = VALUES(picture)
// ");
// $stmt->execute([
//     ":google_id" => $user["google_id"],
//     ":email"     => $user["email"],
//     ":name"      => $user["name"],
//     ":picture"   => $user["picture"],
// ]);

// ─── (Optional) Issue your own session token ─────────────────────────────────
// Replace with a real JWT library (e.g. firebase/php-jwt via Composer) in production.
$appToken = base64_encode(json_encode([
    "sub" => $user["google_id"],
    "email" => $user["email"],
    "iat" => time(),
    "exp" => time() + 60 * 60 * 8,   // 8-hour session
    // ⚠️ This is NOT cryptographically signed — use a real JWT library for production
]));

// ─── Success ──────────────────────────────────────────────────────────────────
echo json_encode([
    "success" => true,
    "token" => $appToken,
    "user" => $user,
]);