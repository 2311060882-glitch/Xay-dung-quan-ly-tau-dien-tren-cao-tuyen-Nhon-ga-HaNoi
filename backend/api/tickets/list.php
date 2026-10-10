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
         WHERE t.user_id = ?
         ORDER BY t.purchased_at DESC, t.id DESC"
    );

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $result = $stmt->get_result();
    $tickets = [];

    while ($row = $result->fetch_assoc()) {
        $tickets[] = [
            'id' => (int) $row['id'],
            'line_id' => (int) $row['line_id'],
            'line_name' => $row['line_name'],
            'ticket_type_id' => (int) $row['ticket_type_id'],
            'ticket_type_name' => $row['ticket_type_name'],
            'ticket_type' => $row['ticket_type'],
            'purchase_price' => $row['purchase_price'],
            'status' => $row['status'],
            'purchased_at' => $row['purchased_at'],
            'valid_from' => $row['valid_from'],
            'expires_at' => $row['expires_at'],
            'used_at' => $row['used_at']
        ];
    }

    $stmt->close();

    respond(
        true,
        'Lấy danh sách vé thành công.',
        $tickets
    );
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());

    respond(false, 'Không thể lấy danh sách vé.', null, 500);
}