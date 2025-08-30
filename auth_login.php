<?php
// /agriflowtrack_2/auth_login.php
declare(strict_types=1);
session_start();
header('Content-Type: application/json');

// --- DB connection (CHANGE if your creds/db differ) ---
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'agriflow';

$mysqli = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'DB connect failed']);
  exit;
}

// --- read POST (FormData) ---
$username = trim($_POST['username'] ?? $_POST['user'] ?? $_POST['email'] ?? '');
$password = (string)($_POST['password'] ?? $_POST['pass'] ?? '');
if ($username === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Missing credentials']);
  exit;
}

// --- ensure users table exists (safe) ---
$mysqli->query("
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  password_md5  CHAR(32) NULL,
  password      VARCHAR(255) NULL,
  role ENUM('admin','user') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// --- fetch user ---
$stmt = $mysqli->prepare("SELECT id, username, password_hash, password_md5, password, role FROM users WHERE username = ? LIMIT 1");
$stmt->bind_param('s', $username);
$stmt->execute();
$res = $stmt->get_result();
$user = $res ? $res->fetch_assoc() : null;

// --- verify ---
$ok = false;
if ($user) {
  if (!empty($user['password_hash']) && password_verify($password, $user['password_hash'])) $ok = true;
  elseif (!empty($user['password_md5']) && md5($password) === strtolower($user['password_md5'])) $ok = true;
  elseif (!empty($user['password']) && hash_equals($user['password'], $password)) $ok = true;
}

if (!$ok) {
  http_response_code(401);
  echo json_encode(['ok'=>false,'error'=>'Invalid credentials']);
  exit;
}

// --- set session & respond ---
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'] ?? 'admin';

echo json_encode(['ok'=>true,'user'=>['id'=>(int)$user['id'],'username'=>$user['username'],'role'=>$_SESSION['role']]]);
