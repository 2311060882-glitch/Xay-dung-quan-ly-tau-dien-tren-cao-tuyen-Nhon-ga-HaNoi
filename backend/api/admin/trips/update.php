<?php

require_once __DIR__ . '/../../../helpers/api.php';
require_method('PATCH');
require_admin();
require_csrf();
$tripId = route_id();
$input = read_json();
if (!$input || array_diff(array_keys($input), ['departure_time', 'capacity'])) {
    validation_error(['fields' => 'Chỉ được sửa departure_time hoặc capacity.']);
}
$departureTime = array_key_exists('departure_time', $input) ? date_value($input, 'departure_time', true) : null;
$capacity = array_key_exists('capacity', $input) ? id_value($input, 'capacity') : null;
if ($capacity !== null && $capacity > 10000) {
    validation_error(['capacity' => 'Sức chứa tối đa 10000.']);
}
if ($departureTime !== null && $departureTime <= date('Y-m-d H:i:s')) {
    validation_error(['departure_time' => 'Giờ khởi hành phải ở tương lai.']);
}
$conn->begin_transaction();
$trip = fetch_one_row('SELECT * FROM trips WHERE id=? FOR UPDATE', [$tripId]);
if (!$trip) {
    $conn->rollback();
    respond(false, 'Không tìm thấy chuyến.', null, 404);
}
if ($trip['status'] !== 'SCHEDULED' || $trip['departure_time'] <= date('Y-m-d H:i:s')) {
    $conn->rollback();
    respond(false, 'Chỉ được sửa chuyến chưa khởi hành.', null, 409);
}
execute_sql('UPDATE trips SET departure_time=?,capacity=? WHERE id=?', [$departureTime ?? $trip['departure_time'], $capacity ?? $trip['capacity'], $tripId]);
$conn->commit();
respond(true, 'Cập nhật chuyến thành công.', fetch_one_row('SELECT * FROM trips WHERE id=?', [$tripId]));
