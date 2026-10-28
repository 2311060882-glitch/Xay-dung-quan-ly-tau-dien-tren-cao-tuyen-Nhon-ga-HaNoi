<?php
require_once __DIR__ . '/../../helpers/api.php';
$userId = require_login();
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    respond(true, 'Danh sách người thân.', fetch_all_rows('SELECT id,fullname,birth_date,relationship FROM relatives WHERE user_id=? AND deleted_at IS NULL ORDER BY id', [$userId]));
}
if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    require_method('GET');
}
require_csrf();
$input = read_json();
$id = $method === 'POST' ? null : id_value($input, 'id');
if ($method !== 'DELETE') {
    $name = text_value($input, 'fullname');
    $birth = date_value($input, 'birth_date');
    $relationship = text_value($input, 'relationship', 50);
    if ($birth > date('Y-m-d')) validation_error(['birth_date' => 'Ngày sinh không được ở tương lai.']);
}
$conn->begin_transaction();
// Cung khoa tai khoan voi luong mua ve va gui ho so, tranh xoa khi dang su dung.
fetch_one_row('SELECT id FROM users WHERE id=? FOR UPDATE', [$userId]);
if ($id && !fetch_one_row('SELECT id FROM relatives WHERE id=? AND user_id=? AND deleted_at IS NULL FOR UPDATE', [$id, $userId])) {
    reject_transaction('Không tìm thấy người thân.', 404);
}
if ($method === 'DELETE') {
    // Xoa mem de giu nguoi su dung tren ve va ho so cu.
    execute_sql('UPDATE relatives SET deleted_at=NOW() WHERE id=? AND user_id=?', [$id, $userId]);
} elseif ($method === 'PUT') {
    execute_sql('UPDATE relatives SET fullname=?,birth_date=?,relationship=? WHERE id=? AND user_id=?', [$name, $birth, $relationship, $id, $userId]);
} else {
    execute_sql('INSERT INTO relatives(user_id,fullname,birth_date,relationship) VALUES(?,?,?,?)', [$userId, $name, $birth, $relationship]);
    $id = $conn->insert_id;
}
$conn->commit();
respond(true, 'Đã lưu thông tin người thân.', ['id' => $id], $method === 'POST' ? 201 : 200);
