<?php

require_once __DIR__ . '/../../helpers/request.php';
require_once __DIR__ . '/../../helpers/auth.php';

require_method('GET');

$userId = require_login();

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
            t.status,
            t.purchased_at,
            t.valid_from,
            t.expires_at
         FROM `tickets` t
         JOIN `lines` l ON l.id = t.line_id
         JOIN `ticket_types` tt ON tt.id = t.ticket_type_id
         WHERE t.user_id = ?
           AND t.status = 'ACTIVE'
           AND t.valid_from <= NOW()
           AND t.expires_at > NOW()
         ORDER BY t.purchased_at DESC, t.id DESC
         LIMIT 1"
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $ticket = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$ticket) {
        respond(
            true,
            'Bạn chưa có vé còn hiệu lực.',
            null
        );
    }

    respond(
        true,
        'Lấy mã QR vé thành công.',
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
            'expires_at' => $ticket['expires_at']
        ]
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy mã QR vé.', null, 500);
}