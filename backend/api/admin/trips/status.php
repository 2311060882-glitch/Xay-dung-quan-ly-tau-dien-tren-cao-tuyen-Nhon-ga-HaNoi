<?php

require_once __DIR__ . '/../../../helpers/api.php';
require_method('PATCH');
require_admin();
require_csrf();
$tripId = route_id();
$status = choice(read_json(), 'status', ['SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED']);
$conn->begin_transaction();
$trip = fetch_one_row('SELECT * FROM trips WHERE id=? FOR UPDATE', [$tripId]);
if (!$trip) {
    $conn->rollback();
    respond(false, 'Không tìm thấy chuyến.', null, 404);
}
$allowedTransitions = [
    'SCHEDULED' => ['RUNNING', 'CANCELLED'],
    'RUNNING' => ['COMPLETED'],
    'COMPLETED' => [],
    'CANCELLED' => []
];
if (!in_array($status, $allowedTransitions[$trip['status']], true)) {
    $conn->rollback();
    respond(false, 'Chuyển trạng thái không hợp lệ.', null, 409);
}
execute_sql('UPDATE trips SET status=? WHERE id=?', [$status, $tripId]);
$conn->commit();
respond(true, 'Cập nhật trạng thái thành công.', fetch_one_row('SELECT * FROM trips WHERE id=?', [$tripId]));
