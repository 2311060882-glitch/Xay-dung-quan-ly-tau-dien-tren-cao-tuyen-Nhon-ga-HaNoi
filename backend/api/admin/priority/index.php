<?php
require_once __DIR__ . '/../../../helpers/api.php';
$adminId = require_admin();
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    [$page,$size,$offset] = pagination();
    $status = isset($_GET['status']) ? choice($_GET, 'status', ['PENDING','APPROVED','REJECTED']) : 'PENDING';
    $total = (int) fetch_one_row('SELECT COUNT(*) AS total FROM priority_applications WHERE status=?', [$status])['total'];
    $rows = fetch_all_rows('SELECT p.*,u.phone,COALESCE(r.fullname,u.fullname) AS passenger_name FROM priority_applications p JOIN users u ON u.id=p.user_id LEFT JOIN relatives r ON r.id=p.relative_id WHERE p.status=? ORDER BY p.id DESC LIMIT ? OFFSET ?', [$status,$size,$offset]);
    respond(true, 'Danh sách hồ sơ.', paged($rows,$total,$page,$size));
}
require_method('PATCH');
require_csrf();
$input = read_json();
$id = id_value($input, 'id');
$status = choice($input, 'status', ['APPROVED','REJECTED']);
$reason = $status === 'REJECTED' ? text_value($input, 'rejection_reason', 1000) : null;
execute_sql("UPDATE priority_applications SET status=?,rejection_reason=?,reviewed_at=NOW(),reviewed_by=? WHERE id=? AND status='PENDING'", [$status,$reason,$adminId,$id]);
if ($conn->affected_rows !== 1) respond(false, 'Hồ sơ không tồn tại hoặc đã được xét duyệt.', null, 409);
respond(true, 'Đã xét duyệt hồ sơ.');
