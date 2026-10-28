<?php

require_once __DIR__ . '/../../helpers/tickets.php';

require_method('GET');
$userId = require_login();

$tickets = ticket_rows(
    't.user_id = ?',
    [$userId],
    'ORDER BY t.purchased_at DESC, t.id DESC'
);
respond(true, 'Lấy danh sách vé thành công.', $tickets);
