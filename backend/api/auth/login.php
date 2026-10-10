<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('POST');

$input = read_json();

foreach (['phone', 'password'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        respond(
            false,
            "Thiếu hoặc sai kiểu dữ liệu: $field.",
            null,
            400
        );
    }
}

$phone = trim($input['phone']);
$userPassword = $input['password'];

if (!preg_match('/^0[0-9]{9}$/', $phone)) {
    respond(false, 'Số điện thoại không hợp lệ.', null, 400);
}

if (
    strlen($userPassword) < 8
    || strlen($userPassword) > 72
    || strpos($userPassword, "\0") !== false
) {
    respond(false, 'Mật khẩu không hợp lệ.', null, 400);
}

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        'SELECT id, fullname, phone, password_hash
         FROM `users`
         WHERE phone = ?'
    );

    $stmt->bind_param('s', $phone);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (
        !$user
        || !password_verify($userPassword, $user['password_hash'])
    ) {
        respond(
            false,
            'Số điện thoại hoặc mật khẩu không đúng.',
            null,
            401
        );
    }

    start_session();

    // Tạo ID session mới sau khi đăng nhập.
    session_regenerate_id(true);

    $_SESSION = [];
    $_SESSION['user_id'] = (int) $user['id'];

    respond(
        true,
        'Đăng nhập thành công.',
        [
            'id' => (int) $user['id'],
            'fullname' => $user['fullname'],
            'phone' => $user['phone'],
            'csrf_token' => csrf_token()
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể đăng nhập.', null, 500);
}