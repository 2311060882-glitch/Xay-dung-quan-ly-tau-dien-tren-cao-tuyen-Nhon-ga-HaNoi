<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('POST');

$userId = require_login();
require_csrf();
$input = read_json();

function positiveId($value): ?int
{
    if (!is_int($value) && !is_string($value)) {
        return null;
    }

    $id = filter_var(
        $value,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1]]
    );

    return $id === false ? null : $id;
}

$lineId = positiveId($input['line_id'] ?? null);
$ticketTypeId = positiveId($input['ticket_type_id'] ?? null);

if ($lineId === null || $ticketTypeId === null) {
    respond(
        false,
        'line_id và ticket_type_id phải là số nguyên dương.',
        null,
        400
    );
}

// Mã ngẫu nhiên để frontend tạo ảnh QR.
$qrCode = bin2hex(random_bytes(32));

require_once __DIR__ . '/../../config/database.php';

$transactionStarted = false;

try {
    $conn->begin_transaction();
    $transactionStarted = true;

    // Khóa dòng tuyến trong lúc xử lý.
    $stmt = $conn->prepare(
        'SELECT status FROM `lines` WHERE id = ? FOR UPDATE'
    );
    $stmt->bind_param('i', $lineId);
    $stmt->execute();
    $line = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$line || $line['status'] !== 'ACTIVE') {
        $conn->rollback();
        $transactionStarted = false;

        respond(false, 'Tuyến không tồn tại hoặc đang ngừng hoạt động.', null, 400);
    }

    // Giá và thời hạn lấy từ database, không nhận từ frontend.
    $stmt = $conn->prepare(
        'SELECT price, valid_days
         FROM `ticket_types`
         WHERE id = ?
         FOR UPDATE'
    );
    $stmt->bind_param('i', $ticketTypeId);
    $stmt->execute();
    $ticketType = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$ticketType) {
        $conn->rollback();
        $transactionStarted = false;

        respond(false, 'Không tìm thấy loại vé.', null, 404);
    }

    $price = $ticketType['price'];
    $validDays = (int) $ticketType['valid_days'];

    // Trừ tiền chỉ khi số dư đủ.
    // Database thực hiện phép tính để tránh sai số tiền tệ.
    $stmt = $conn->prepare(
        'UPDATE `users`
         SET wallet_balance = wallet_balance - ?
         WHERE id = ? AND wallet_balance >= ?'
    );
    $stmt->bind_param('sis', $price, $userId, $price);
    $stmt->execute();
    $updated = $stmt->affected_rows;
    $stmt->close();

    if ($updated !== 1) {
        $conn->rollback();
        $transactionStarted = false;

        respond(false, 'Tài khoản không tồn tại hoặc số dư không đủ.', null, 409);
    }

    // Quy tắc bài tập: vé có hiệu lực ngay lúc mua.
    // Mỗi valid_days tương ứng số ngày tính từ thời điểm này.
    $stmt = $conn->prepare(
        "INSERT INTO `tickets`
            (user_id, ticket_type_id, line_id, qr_code,
             purchase_price, status, purchased_at,
             valid_from, expires_at)
         VALUES (
             ?, ?, ?, ?, ?, 'ACTIVE',
             NOW(), NOW(), DATE_ADD(NOW(), INTERVAL ? DAY)
         )"
    );
    $stmt->bind_param(
        'iiissi',
        $userId,
        $ticketTypeId,
        $lineId,
        $qrCode,
        $price,
        $validDays
    );
    $stmt->execute();
    $ticketId = (int) $conn->insert_id;
    $stmt->close();

    // Ghi giao dịch mua vé.
    $stmt = $conn->prepare(
        "INSERT INTO `wallet_transactions`
            (user_id, ticket_id, type, amount)
         VALUES (?, ?, 'BUY_TICKET', ?)"
    );
    $stmt->bind_param('iis', $userId, $ticketId, $price);
    $stmt->execute();
    $stmt->close();

    // Lấy thông tin để trả về.
    $stmt = $conn->prepare(
        'SELECT t.valid_from, t.expires_at, u.wallet_balance
         FROM `tickets` t
         JOIN `users` u ON u.id = t.user_id
         WHERE t.id = ?'
    );
    $stmt->bind_param('i', $ticketId);
    $stmt->execute();
    $details = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $conn->commit();
    $transactionStarted = false;

    respond(
        true,
        'Mua vé thành công.',
        [
            'ticket_id' => $ticketId,
            'line_id' => $lineId,
            'ticket_type_id' => $ticketTypeId,
            'qr_code' => $qrCode,
            'purchase_price' => $price,
            'status' => 'ACTIVE',
            'valid_from' => $details['valid_from'],
            'expires_at' => $details['expires_at'],
            'wallet_balance' => $details['wallet_balance']
        ],
        201
    );
} catch (mysqli_sql_exception $e) {
    if ($transactionStarted) {
        $conn->rollback();
    }

    error_log($e->getMessage());

    respond(false, 'Không thể mua vé.', null, 500);
}