<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('PUT');

$userId = require_login();
require_csrf();
$input = read_json();

// API này yêu cầu gửi cả fullname và phone.
foreach (['fullname', 'phone'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        validation_error([$field => "Thiếu hoặc sai kiểu dữ liệu: $field."]);
    }
}

$fullname = trim($input['fullname']);
$phone = trim($input['phone']);

$nameLength = preg_match_all('/./us', $fullname);

if ($nameLength === false || $nameLength < 1 || $nameLength > 100) {
    validation_error(['fullname' => 'Họ tên phải có từ 1 đến 100 ký tự.']);
}

if (!preg_match('/^0[0-9]{9}$/', $phone)) {
    validation_error(['phone' => 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.']);
}

require_once __DIR__ . '/../../config/database.php';

$transactionStarted = false;

try {
    $conn->begin_transaction();
    $transactionStarted = true;

    // Kiểm tra tài khoản và khóa dòng trong lúc cập nhật.
    $stmt = $conn->prepare(
        'SELECT id FROM `users` WHERE id = ? FOR UPDATE'
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

    $stmt = $conn->prepare(
        'UPDATE `users`
         SET fullname = ?, phone = ?
         WHERE id = ?'
    );

    $stmt->bind_param('ssi', $fullname, $phone, $userId);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
    $transactionStarted = false;

    respond(
        true,
        'Cập nhật thông tin thành công.',
        [
            'id' => $userId,
            'fullname' => $fullname,
            'phone' => $phone
        ]
    );
} catch (mysqli_sql_exception $e) {
    if ($transactionStarted) {
        $conn->rollback();
    }

    if ($e->getCode() === 1062) {
        respond(
            false,
            'Số điện thoại đã được tài khoản khác sử dụng.',
            null,
            409
        );
    }

    error_log($e->getMessage());

    respond(false, 'Không thể cập nhật thông tin.', null, 500);
}
