<?php
require_once __DIR__ . '/../../../helpers/api.php';
require_admin();
$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['POST','PUT'], true)) require_method('POST');
require_csrf();
$input = read_json();
$lineId = id_value($input, 'line_id');
$name = text_value($input, 'name');
$order = id_value($input, 'order_index');
$id = $method === 'PUT' ? id_value($input, 'id') : null;
$conn->begin_transaction();
// Khoa tuyen de hai lan doi thu tu khong cung chiem mot vi tri.
if (!fetch_one_row('SELECT id FROM `lines` WHERE id=? FOR UPDATE', [$lineId])) reject_transaction('Không tìm thấy tuyến.', 404);
if ($id) {
    $station = fetch_one_row('SELECT * FROM stations WHERE id=? FOR UPDATE', [$id]);
    if (!$station) reject_transaction('Không tìm thấy ga.', 404);
    if ((int) $station['line_id'] !== $lineId) reject_transaction('Không chuyển ga sang tuyến khác vì có thể ảnh hưởng lịch sử.', 400);
}
if (fetch_one_row('SELECT id FROM stations WHERE line_id=? AND order_index=? AND id<>?', [$lineId,$order,$id ?? 0])) reject_transaction('Thứ tự ga đã được sử dụng. Hãy chọn vị trí trống.');
if ($id) execute_sql('UPDATE stations SET name=?,order_index=? WHERE id=?', [$name,$order,$id]);
else {
    execute_sql('INSERT INTO stations(line_id,name,order_index) VALUES(?,?,?)', [$lineId,$name,$order]);
    $id = $conn->insert_id;
}
$conn->commit();
respond(true, 'Đã lưu ga.', ['id' => $id], $method === 'POST' ? 201 : 200);
