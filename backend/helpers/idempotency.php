<?php

require_once __DIR__ . '/api.php';

function request_key(): string
{
    $key = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '';
    if (!is_string($key) || !preg_match('/^[A-Za-z0-9:_-]{1,64}$/D', $key)) {
        validation_error([
            'Idempotency-Key' => 'Gửi header Idempotency-Key từ 1 đến 64 ký tự chữ, số, :, _ hoặc -.'
        ]);
    }
    return $key;
}

// Khóa users trước khi gọi để các thao tác ví cùng tài khoản được xử lý tuần tự.
function previous_transaction(int $userId, string $key): ?array
{
    return fetch_one_row(
        'SELECT * FROM wallet_transactions WHERE user_id = ? AND idempotency_key = ? FOR UPDATE',
        [$userId, $key]
    );
}
