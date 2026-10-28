<?php

require_once __DIR__ . '/../../helpers/api.php';
require_method('GET');
require_once __DIR__ . '/../../helpers/automatic-trips.php';
sync_automatic_trips();
$where = ['1=1'];
$params = [];
if (isset($_GET['date'])) {
    $date = date_value($_GET, 'date');
    $where[] = 'tr.departure_time>=? AND tr.departure_time<DATE_ADD(?,INTERVAL 1 DAY)';
    $params[] = $date;
    $params[] = $date;
}
if (isset($_GET['line_id'])) {
    $where[] = 'tr.line_id=?';
    $params[] = id_value($_GET, 'line_id');
}
if (isset($_GET['direction'])) {
    $where[] = 'tr.direction=?';
    $params[] = choice($_GET, 'direction', ['OUTBOUND', 'INBOUND']);
}
if (isset($_GET['status'])) {
    $where[] = 'tr.status=?';
    $params[] = choice($_GET, 'status', ['SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED']);
}
$where = implode(' AND ', $where);
[$page, $pageSize, $offset] = pagination();
$total = (int) fetch_one_row("SELECT COUNT(*) AS total FROM trips tr WHERE $where", $params)['total'];
$items = fetch_all_rows("SELECT tr.*,l.name AS line_name
 FROM trips tr JOIN `lines` l ON l.id=tr.line_id WHERE $where
 ORDER BY tr.departure_time,tr.id LIMIT ? OFFSET ?", [...$params, $pageSize, $offset]);
respond(true, 'Lấy lịch chạy tàu thành công.', paged($items, $total, $page, $pageSize));
