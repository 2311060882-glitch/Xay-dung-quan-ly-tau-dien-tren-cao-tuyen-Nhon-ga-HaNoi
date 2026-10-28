<?php

require_once __DIR__ . '/response.php';
function start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start([
                'use_strict_mode' => true,
                'cookie_httponly' => true,
                'cookie_samesite' => 'Lax',
                'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'
        ]);
    }
}

function require_login(): int
{
    start_session();
    if (empty($_SESSION['user_id'])) {
        respond(false, 'Bạn cần đăng nhập.', null, 401);
    }
    return (int) $_SESSION['user_id'];
}
// Luôn đọc quyền từ DB, không tin role do client gửi hoặc role cũ trong session.
function require_admin(): int
{
    $userId = require_login();
    require_once __DIR__ . '/../config/database.php';
    global $conn;
    $stmt = $conn->prepare('SELECT role FROM users WHERE id=?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$user) {
        respond(false, 'Tài khoản không còn tồn tại.', null, 401);
    }
    if ($user['role'] !== 'ADMIN') {
        respond(false, 'Chỉ quản trị viên được thực hiện thao tác này.', null, 403);
    }
    return $userId;
}
