<?php

require_once __DIR__ . '/../../helpers/idempotency.php';

function purchase_response(int $ticketId): void
{
    $ticket = fetch_one_row(
        'SELECT t.id AS ticket_id, t.line_id, t.ticket_type_id, t.qr_code,
            t.origin_station_id, t.destination_station_id,
            t.purchase_price, t.status, t.valid_from, t.expires_at, u.wallet_balance
         FROM tickets t
         JOIN users u ON u.id = t.user_id
         WHERE t.id = ?',
        [$ticketId]
    );
    respond(true, 'Mua vé thành công.', $ticket, 201);
}

require_method('POST');
$userId = require_login();
require_csrf();

$input = read_json();
$lineId = id_value($input, 'line_id');
$typeId = id_value($input, 'ticket_type_id');
$originId = isset($input['origin_station_id']) ? id_value($input, 'origin_station_id') : null;
$destinationId = isset($input['destination_station_id']) ? id_value($input, 'destination_station_id') : null;
$relativeId = isset($input['relative_id']) ? id_value($input, 'relative_id') : null;
$key = request_key();

$conn->begin_transaction();
fetch_one_row('SELECT id FROM users WHERE id = ? FOR UPDATE', [$userId]);

$previous = previous_transaction($userId, $key);
if ($previous) {
    $ticket = $previous['ticket_id']
        ? fetch_one_row('SELECT * FROM tickets WHERE id = ?', [$previous['ticket_id']])
        : null;

    if (
        $previous['type'] !== 'BUY_TICKET'
        || !$ticket
        || (int) $ticket['line_id'] !== $lineId
        || (int) $ticket['ticket_type_id'] !== $typeId
        || ($ticket['relative_id'] === null ? null : (int) $ticket['relative_id']) !== $relativeId
        || ($ticket['origin_station_id'] === null ? null : (int) $ticket['origin_station_id']) !== $originId
        || ($ticket['destination_station_id'] === null ? null : (int) $ticket['destination_station_id']) !== $destinationId
    ) {
        reject_transaction('Idempotency-Key đã dùng cho nội dung khác.');
    }

    $conn->commit();
    purchase_response((int) $ticket['id']);
}

$line = fetch_one_row('SELECT status FROM `lines` WHERE id = ? LOCK IN SHARE MODE', [$lineId]);
if (!$line || $line['status'] !== 'ACTIVE') {
    reject_transaction('Tuyến không tồn tại hoặc ngừng hoạt động.', 400);
}

$type = fetch_one_row('SELECT * FROM ticket_types WHERE id = ? LOCK IN SHARE MODE', [$typeId]);
if (!$type) {
    reject_transaction('Không tìm thấy loại vé.', 404);
}

// Ve moi tinh gia theo loai; cot ga cu van giu de doc ve da ban.
if ($originId !== null || $destinationId !== null) {
    reject_transaction('Chỉ chọn tuyến và loại vé, không chọn ga đi/đến.', 400);
}
$passenger = fetch_one_row('SELECT fullname FROM users WHERE id=?', [$userId]);
if ($relativeId) {
    $passenger = fetch_one_row('SELECT fullname FROM relatives WHERE id=? AND user_id=? AND deleted_at IS NULL', [$relativeId,$userId]);
    if (!$passenger) reject_transaction('Không tìm thấy người sử dụng.', 404);
}
if ($type['requires_priority'] && !fetch_one_row("SELECT id FROM priority_applications WHERE user_id=? AND relative_id <=> ? AND status='APPROVED' LOCK IN SHARE MODE", [$userId,$relativeId])) {
    reject_transaction('Người sử dụng chưa được duyệt hồ sơ ưu tiên.', 403);
}
$price = $type['price'];

// Tiền, vé và giao dịch cùng được lưu hoặc cùng rollback.
execute_sql('UPDATE users SET wallet_balance=wallet_balance-? WHERE id=? AND wallet_balance>=?', [$price,$userId,$price]);
if ($conn->affected_rows !== 1) reject_transaction('Số dư không đủ.');
execute_sql('INSERT INTO tickets(user_id,ticket_type_id,line_id,qr_code,purchase_price,valid_from,expires_at,relative_id,passenger_name) VALUES(?,?,?,?,?,NOW(),DATE_ADD(NOW(),INTERVAL ? DAY),?,?)', [$userId,$typeId,$lineId,bin2hex(random_bytes(32)),$price,$type['valid_days'],$relativeId,$passenger['fullname']]);
$ticketId = $conn->insert_id;
execute_sql("INSERT INTO wallet_transactions(user_id,ticket_id,type,amount,idempotency_key) VALUES(?,?,'BUY_TICKET',?,?)", [$userId,$ticketId,$price,$key]);
$conn->commit();
purchase_response($ticketId);
