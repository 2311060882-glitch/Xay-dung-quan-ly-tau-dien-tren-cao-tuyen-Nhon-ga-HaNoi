<?php
require_once __DIR__ . '/../../../helpers/api.php';
require_admin();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') respond(true, 'Danh sách tuyến.', fetch_all_rows('SELECT * FROM `lines` ORDER BY id'));
if (!in_array($method, ['POST','PUT'], true)) require_method('GET');
require_csrf();
$input = read_json();
$name = text_value($input, 'name');
$status = choice($input, 'status', ['ACTIVE','INACTIVE']);
if ($method === 'POST') {
    execute_sql('INSERT INTO `lines`(name,status) VALUES(?,?)', [$name,$status]);
    respond(true, 'Đã thêm tuyến.', ['id' => $conn->insert_id], 201);
}
$id = id_value($input, 'id');
if (!fetch_one_row('SELECT id FROM `lines` WHERE id=?', [$id])) respond(false, 'Không tìm thấy tuyến.', null, 404);
execute_sql('UPDATE `lines` SET name=?,status=? WHERE id=?', [$name,$status,$id]);
respond(true, 'Đã cập nhật tuyến.');
