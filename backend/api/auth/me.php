<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('GET');

// Lấy ID từ session; chưa đăng nhập sẽ trả lỗi 401.
$userId = require_login();

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        'SELECT id, fullname, phone, created_at
         FROM `users`
         WHERE id = ?'
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        unset($_SESSION['user_id']);

        respond(false, 'Tài khoản không còn tồn tại.', null, 401);
    }

    respond(
        true,
        'Lấy thông tin cá nhân thành công.',
        [
            'id' => (int) $user['id'],
            'fullname' => $user['fullname'],
            'phone' => $user['phone'],
            'created_at' => $user['created_at'],
            'csrf_token' => csrf_token()
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy thông tin cá nhân.', null, 500);
}