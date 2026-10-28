<?php

require_once __DIR__ . '/../../helpers/request.php';

require_method('POST');

$input = read_json();

foreach (['fullname', 'phone', 'password'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        validation_error([$field => "Thiếu hoặc sai kiểu dữ liệu: $field."]);
    }
}

$fullname = trim($input['fullname']);
$phone = trim($input['phone']);
$userPassword = $input['password'];

$nameLength = preg_match_all('/./us', $fullname);

if ($nameLength === false || $nameLength < 1 || $nameLength > 100) {
    validation_error(['fullname' => 'Họ tên phải có từ 1 đến 100 ký tự.']);
}

if (!preg_match('/^0[0-9]{9}$/', $phone)) {
    validation_error(['phone' => 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.']);
}

if (
    strlen($userPassword) < 8
    || strlen($userPassword) > 72
    || strpos($userPassword, "\0") !== false
) {
    validation_error(['password' => 'Mật khẩu phải dài từ 8 đến 72 byte và không chứa ký tự NULL.']);
}

$passwordHash = password_hash($userPassword, PASSWORD_BCRYPT);

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        'INSERT INTO `users` (fullname, phone, password_hash)
         VALUES (?, ?, ?)'
    );

    $stmt->bind_param('sss', $fullname, $phone, $passwordHash);
    $stmt->execute();

    $userId = (int) $conn->insert_id;
    $stmt->close();

    respond(
        true,
        'Đăng ký thành công.',
        [
            'id' => $userId,
            'fullname' => $fullname,
            'phone' => $phone
        ],
        201
    );
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        respond(false, 'Số điện thoại đã được đăng ký.', null, 409);
    }

    error_log($e->getMessage());

    respond(false, 'Không thể đăng ký tài khoản.', null, 500);
}
