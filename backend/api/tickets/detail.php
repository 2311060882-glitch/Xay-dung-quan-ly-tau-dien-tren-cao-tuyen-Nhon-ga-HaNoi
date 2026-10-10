<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';

require_method('GET');

$userId = require_login();

$ticketId = filter_input(
    INPUT_GET,
    'id',
    FILTER_VALIDATE_INT,
    ['options' => ['min_range' => 1]]
);

if ($ticketId === false || $ticketId === null) {
    respond(false, 'id vé phải là số nguyên dương.', null, 400);
}

require_once __DIR__ . '/../../config/database.php';

try {
    $stmt = $conn->prepare(
        "SELECT
            t.id,
            t.line_id,
            l.name AS line_name,
            t.ticket_type_id,
            tt.name AS ticket_type_name,
            tt.type AS ticket_type,
            t.qr_code,
            t.purchase_price,
            CASE
                WHEN t.status = 'ACTIVE' AND t.expires_at <= NOW()
                    THEN 'EXPIRED'
                ELSE t.status
            END AS status,
            t.purchased_at,
            t.valid_from,
            t.expires_at,
            t.used_at
         FROM `tickets` t
         JOIN `lines` l ON l.id = t.line_id
         JOIN `ticket_types` tt ON tt.id = t.ticket_type_id
         WHERE t.id = ? AND t.user_id = ?"
    );

    $stmt->bind_param('ii', $ticketId, $userId);
    $stmt->execute();

    $ticket = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$ticket) {
        respond(false, 'Không tìm thấy vé.', null, 404);
    }

    respond(
        true,
        'Lấy chi tiết vé thành công.',
        [
            'id' => (int) $ticket['id'],
            'line_id' => (int) $ticket['line_id'],
            'line_name' => $ticket['line_name'],
            'ticket_type_id' => (int) $ticket['ticket_type_id'],
            'ticket_type_name' => $ticket['ticket_type_name'],
            'ticket_type' => $ticket['ticket_type'],
            'qr_code' => $ticket['qr_code'],
            'purchase_price' => $ticket['purchase_price'],
            'status' => $ticket['status'],
            'purchased_at' => $ticket['purchased_at'],
            'valid_from' => $ticket['valid_from'],
            'expires_at' => $ticket['expires_at'],
            'used_at' => $ticket['used_at']
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy chi tiết vé.', null, 500);
}