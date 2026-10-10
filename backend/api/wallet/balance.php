<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';

require_method('GET');

$userId = require_login();

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        'SELECT wallet_balance
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
        'Lấy số dư ví thành công.',
        [
            'wallet_balance' => $user['wallet_balance']
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy số dư ví.', null, 500);
}