<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';

require_method('GET');

$userId = require_login();

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        'SELECT id, ticket_id, type, amount, created_at
         FROM `wallet_transactions`
         WHERE user_id = ?
         ORDER BY created_at DESC, id DESC'
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $result = $stmt->get_result();
    $transactions = [];

    while ($row = $result->fetch_assoc()) {
        $transactions[] = [
            'id' => (int) $row['id'],
            'ticket_id' => $row['ticket_id'] === null
            ? null
            : (int) $row['ticket_id'],
            'type' => $row['type'],
            'amount' => $row['amount'],
            'created_at' => $row['created_at']
        ];
    }

    $stmt->close();

    respond(
        true,
        'Lấy lịch sử giao dịch thành công.',
        $transactions
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy lịch sử giao dịch.', null, 500);
}
