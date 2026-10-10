<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/csrf.php';

require_method('POST');

$userId = require_login();
require_csrf();
$input = read_json();

// Bài tập chỉ nhận số tiền nguyên theo VND.
// Chấp nhận JSON number hoặc chuỗi chữ số.
$rawAmount = $input['amount'] ?? null;

if (!is_int($rawAmount) && !is_string($rawAmount)) {
    respond(false, 'Số tiền phải là số nguyên VND.', null, 400);
}

$amountText = (string) $rawAmount;

if (
    !preg_match('/^[1-9][0-9]{0,6}$/', $amountText)
    || (int) $amountText > 5000000
) {
    respond(
        false,
        'Mỗi lần nạp phải từ 1 đến 5.000.000 đồng.',
        null,
        400
    );
}

require_once __DIR__ . '/../../config/database.php';

$transactionStarted = false;

try {
    $conn->begin_transaction();
    $transactionStarted = true;

    // Cộng tiền trực tiếp trong database để tránh mất cập nhật.
    // Đồng thời bảo đảm số dư không vượt giới hạn DECIMAL(12,2).
    $stmt = $conn->prepare(
        'UPDATE `users`
         SET wallet_balance = wallet_balance + ?
         WHERE id = ?
           AND wallet_balance <= 9999999999.99 - ?'
    );

    $stmt->bind_param('sis', $amountText, $userId, $amountText);
    $stmt->execute();

    $updated = $stmt->affected_rows;
    $stmt->close();

    if ($updated !== 1) {
        $conn->rollback();
        $transactionStarted = false;

        respond(
            false,
            'Không thể nạp tiền: tài khoản không tồn tại hoặc số dư vượt giới hạn.',
            null,
            409
        );
    }

    // Giao dịch nạp tiền không liên quan đến vé.
    $stmt = $conn->prepare(
        "INSERT INTO `wallet_transactions`
            (user_id, ticket_id, type, amount)
         VALUES (?, NULL, 'TOPUP', ?)"
    );

    $stmt->bind_param('is', $userId, $amountText);
    $stmt->execute();

    $transactionId = (int) $conn->insert_id;
    $stmt->close();

    $stmt = $conn->prepare(
        'SELECT wallet_balance FROM `users` WHERE id = ?'
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $conn->commit();
    $transactionStarted = false;

    respond(
        true,
        'Nạp tiền giả lập thành công.',
        [
            'transaction_id' => $transactionId,
            'amount' => $amountText . '.00',
            'wallet_balance' => $user['wallet_balance']
        ],
        201
    );
} catch (mysqli_sql_exception $e) {
    if ($transactionStarted) {
        $conn->rollback();
    }

    error_log($e->getMessage());

    respond(false, 'Không thể nạp tiền vào ví.', null, 500);
}