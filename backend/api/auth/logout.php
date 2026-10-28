<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('POST');

require_login();
require_csrf();

// Xóa dữ liệu trong session.
$_SESSION = [];

// Xóa cookie chứa ID session ở client.
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();

    setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax'
    ]);
}

// Hủy session trên server.
session_destroy();

respond(true, 'Đăng xuất thành công.');
