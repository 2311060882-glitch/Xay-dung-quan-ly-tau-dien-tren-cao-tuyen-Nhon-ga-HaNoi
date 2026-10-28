<?php

require_once __DIR__ . '/../../helpers/tickets.php';

require_method('GET');
$userId = require_login();
$ticketId = route_id();

$tickets = ticket_rows('t.id = ? AND t.user_id = ?', [$ticketId, $userId]);
if (!$tickets) {
    respond(false, 'Không tìm thấy vé.', null, 404);
}
respond(true, 'Lấy chi tiết vé thành công.', $tickets[0]);
