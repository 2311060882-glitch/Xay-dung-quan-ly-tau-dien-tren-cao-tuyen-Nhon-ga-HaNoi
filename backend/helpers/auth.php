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
