<?php

require_once __DIR__ . '/../../../helpers/api.php';
require_method('GET');
require_admin();
[$where, $params] = ticket_filters();
if (isset($_GET['search'])) {
    $search = text_value($_GET, 'search');
    $where .= ' AND (t.id=? OR t.user_id IN (SELECT id FROM users WHERE fullname LIKE ? OR phone LIKE ?) OR t.passenger_name LIKE ?)';
    array_push($params, $search, '%' . $search . '%', '%' . $search . '%', '%' . $search . '%');
}
[$page, $pageSize, $offset] = pagination();
$total = (int) fetch_one_row("SELECT COUNT(*) AS total FROM tickets t WHERE $where", $params)['total'];
$items = fetch_all_rows("SELECT t.id,t.user_id,u.fullname,u.phone,t.line_id,l.name AS line_name,
 t.ticket_type_id,tt.name AS ticket_type_name,t.purchase_price,t.purchased_at,t.expires_at,
 CASE WHEN t.status='ACTIVE' AND t.expires_at<=NOW() THEN 'EXPIRED' ELSE t.status END AS status
 FROM tickets t JOIN users u ON u.id=t.user_id JOIN `lines` l ON l.id=t.line_id
 JOIN ticket_types tt ON tt.id=t.ticket_type_id WHERE $where
 ORDER BY t.purchased_at DESC,t.id DESC LIMIT ? OFFSET ?", [...$params, $pageSize, $offset]);
respond(true, 'Lấy danh sách vé đã bán thành công.', paged($items, $total, $page, $pageSize));
