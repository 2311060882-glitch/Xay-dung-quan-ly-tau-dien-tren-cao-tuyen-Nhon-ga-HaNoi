<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('POST');

$userId = require_login();
require_csrf();
$input = read_json();

foreach (['current_password', 'new_password'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        respond(false, "Thiếu hoặc sai kiểu dữ liệu: $field.", null, 400);
    }
}

$currentPassword = $input['current_password'];
$newPassword = $input['new_password'];

foreach ([$currentPassword, $newPassword] as $value) {
    if (
        strlen($value) < 8
        || strlen($value) > 72
        || strpos($value, "\0") !== false
    ) {
        respond(
            false,
            'Mật khẩu phải dài từ 8 đến 72 byte và không chứa ký tự NULL.',
            null,
            400
        );
    }
}

if ($currentPassword === $newPassword) {
    respond(false, 'Mật khẩu mới phải khác mật khẩu hiện tại.', null, 400);
}

require_once __DIR__ . '/../../config/database.php';

$transactionStarted = false;

try {
    $conn->begin_transaction();
    $transactionStarted = true;

    $stmt = $conn->prepare(
        'SELECT password_hash
         FROM `users`
         WHERE id = ?
         FOR UPDATE'
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        $conn->rollback();
        $transactionStarted = false;

        unset($_SESSION['user_id']);

        respond(false, 'Tài khoản không còn tồn tại.', null, 401);
    }

    if (!password_verify($currentPassword, $user['password_hash'])) {
        $conn->rollback();
        $transactionStarted = false;

        respond(false, 'Mật khẩu hiện tại không đúng.', null, 400);
    }

    $newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT);

    $stmt = $conn->prepare(
        'UPDATE `users` SET password_hash = ? WHERE id = ?'
    );

    $stmt->bind_param('si', $newPasswordHash, $userId);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    $transactionStarted = false;

    // Đổi ID session và giữ phiên đăng nhập hiện tại.
    session_regenerate_id(true);

    respond(true, 'Đổi mật khẩu thành công.');
} catch (mysqli_sql_exception $e) {
    if ($transactionStarted) {
        $conn->rollback();
    }

    error_log($e->getMessage());

    respond(false, 'Không thể đổi mật khẩu.', null, 500);
}