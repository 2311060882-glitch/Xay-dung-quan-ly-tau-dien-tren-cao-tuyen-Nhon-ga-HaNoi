<?php

require_once __DIR__ . '/auth.php';

// Lấy token của phiên hiện tại; chưa có thì tạo mới.
function csrf_token(): string
{
    start_session();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

// Kiểm tra token frontend gửi trong header.
function require_csrf(): void
{
    start_session();

    $providedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $storedToken = $_SESSION['csrf_token'] ?? '';

    if (
        !is_string($providedToken)
        || !is_string($storedToken)
        || $storedToken === ''
        || !hash_equals($storedToken, $providedToken)
    ) {
        respond(false, 'CSRF token thiếu hoặc không hợp lệ.', null, 403);
    }
}