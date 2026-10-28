<?php

require_once __DIR__ . '/../../../helpers/api.php';
require_method('POST');
require_admin();
require_csrf();
$input = read_json();
$lineId = id_value($input, 'line_id');
$tripCode = text_value($input, 'trip_code', 50);
if (!preg_match('/^[A-Za-z0-9_-]+$/', $tripCode)) {
    validation_error(['trip_code' => 'Chỉ dùng chữ, số, gạch ngang, gạch dưới.']);
}
if (str_starts_with($tripCode, 'AUTO-')) {
    validation_error(['trip_code' => 'Tiền tố AUTO- dành cho chuyến tự động.']);
}
$direction = choice($input, 'direction', ['OUTBOUND', 'INBOUND']);
$departureTime = date_value($input, 'departure_time', true);
$capacity = isset($input['capacity']) ? id_value($input, 'capacity') : 100;
if ($capacity > 10000) {
    validation_error(['capacity' => 'Sức chứa tối đa 10000.']);
}
if ($departureTime <= date('Y-m-d H:i:s')) {
    validation_error(['departure_time' => 'Giờ khởi hành phải ở tương lai.']);
}
$line = fetch_one_row('SELECT status FROM `lines` WHERE id=?', [$lineId]);
if (!$line || $line['status'] !== 'ACTIVE') {
    validation_error(['line_id' => 'Tuyến không tồn tại hoặc ngừng hoạt động.']);
}
try {
    execute_sql('INSERT INTO trips (line_id,trip_code,direction,departure_time,capacity) VALUES (?,?,?,?,?)',
        [$lineId, $tripCode, $direction, $departureTime, $capacity]);
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        respond(false, 'Mã chuyến đã tồn tại.', null, 409);
    }
    throw $e;
}
respond(true, 'Tạo chuyến thành công.', fetch_one_row('SELECT * FROM trips WHERE id=?', [$conn->insert_id]), 201);
