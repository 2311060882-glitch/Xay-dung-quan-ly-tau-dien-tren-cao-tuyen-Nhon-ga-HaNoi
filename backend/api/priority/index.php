<?php
require_once __DIR__ . '/../../helpers/api.php';
$userId = require_login();
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(true, 'Hồ sơ ưu tiên.', fetch_all_rows('SELECT p.*,COALESCE(r.fullname,u.fullname) AS passenger_name FROM priority_applications p JOIN users u ON u.id=p.user_id LEFT JOIN relatives r ON r.id=p.relative_id WHERE p.user_id=? ORDER BY p.id DESC', [$userId]));
}
require_method('POST');
require_csrf();
$input = read_json();
$relativeId = isset($input['relative_id']) ? id_value($input, 'relative_id') : null;
$reason = text_value($input, 'reason', 1000);
$conn->begin_transaction();
fetch_one_row('SELECT id FROM users WHERE id=? FOR UPDATE', [$userId]);
if ($relativeId && !fetch_one_row('SELECT id FROM relatives WHERE id=? AND user_id=? AND deleted_at IS NULL', [$relativeId, $userId])) {
    reject_transaction('Không tìm thấy người thân.', 404);
}
if (fetch_one_row("SELECT id FROM priority_applications WHERE user_id=? AND relative_id <=> ? AND status IN ('PENDING','APPROVED') FOR UPDATE", [$userId, $relativeId])) {
    reject_transaction('Người sử dụng đã có hồ sơ chờ duyệt hoặc được duyệt.');
}
execute_sql('INSERT INTO priority_applications(user_id,relative_id,reason) VALUES(?,?,?)', [$userId, $relativeId, $reason]);
$id = $conn->insert_id;
$conn->commit();
respond(true, 'Đã gửi hồ sơ chờ duyệt.', ['id' => $id], 201);
