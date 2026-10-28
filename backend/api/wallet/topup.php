<?php

require_once __DIR__ . '/../../helpers/idempotency.php';

require_method('POST');
$userId = require_login();
require_csrf();

$input = read_json();
$amount = id_value($input, 'amount');
if ($amount > 5000000) {
    validation_error(['amount' => 'Mỗi lần nạp từ 1 đến 5.000.000 đồng.']);
}
$key = request_key();

$conn->begin_transaction();
fetch_one_row('SELECT id FROM users WHERE id = ? FOR UPDATE', [$userId]);
$previous = previous_transaction($userId, $key);

if ($previous) {
    if ($previous['type'] !== 'TOPUP' || $previous['amount'] !== $amount . '.00') {
        reject_transaction('Idempotency-Key đã dùng cho nội dung khác.');
    }
    $transactionId = $previous['id'];
} else {
    execute_sql(
        'UPDATE users SET wallet_balance = wallet_balance + ?
         WHERE id = ? AND wallet_balance <= 9999999999.99 - ?',
        [$amount, $userId, $amount]
    );
    if ($conn->affected_rows !== 1) {
        reject_transaction('Số dư vượt giới hạn.');
    }

    execute_sql(
        "INSERT INTO wallet_transactions (user_id, type, amount, idempotency_key)
         VALUES (?, 'TOPUP', ?, ?)",
        [$userId, $amount, $key]
    );
    $transactionId = $conn->insert_id;
}

$balance = fetch_one_row('SELECT wallet_balance FROM users WHERE id = ?', [$userId]);
$conn->commit();

respond(true, 'Nạp tiền giả lập thành công.', [
    'transaction_id' => (int) $transactionId,
    'amount' => $amount . '.00',
    'wallet_balance' => $balance['wallet_balance']
], 201);
