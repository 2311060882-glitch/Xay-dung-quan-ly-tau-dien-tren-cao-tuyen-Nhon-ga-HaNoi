<?php

require_once __DIR__ . '/../../helpers/tickets.php';

require_method('GET');
$userId = require_login();

$tickets = ticket_rows(
    "t.user_id = ? AND (
        j.id IS NOT NULL
        OR (t.status = 'ACTIVE' AND t.valid_from <= NOW() AND t.expires_at > NOW())
    )",
    [$userId],
    'ORDER BY (j.id IS NOT NULL) DESC, t.purchased_at DESC, t.id DESC LIMIT 1'
);
$ticket = $tickets[0] ?? null;
if ($ticket) {
    // Giữ cấu trúc active-qr cũ, không bổ sung trường used_at.
    unset($ticket['used_at']);
}
respond(true, $ticket ? 'Lấy mã QR vé thành công.' : 'Bạn chưa có vé còn hiệu lực.', $ticket);
