<?php
require_once __DIR__ . '/../../../helpers/api.php';
require_method('GET');
require_admin();
$from = isset($_GET['from']) ? date_value($_GET,'from') : '1970-01-01';
$to = isset($_GET['to']) ? date_value($_GET,'to') : date('Y-m-d');
if ($from > $to) validation_error(['to' => 'Ngày kết thúc phải từ ngày bắt đầu.']);
$stationId = isset($_GET['station_id']) ? id_value($_GET,'station_id') : null;
// Loc thoi gian vao/ra rieng, khong tinh luot ra theo ngay vao.
$rows = fetch_all_rows('SELECT s.id,s.name,l.name AS line_name,
 (SELECT COUNT(*) FROM journeys j WHERE j.origin_station_id=s.id AND j.checked_in_at>=? AND j.checked_in_at<DATE_ADD(?,INTERVAL 1 DAY)) AS entries,
 (SELECT COUNT(*) FROM journeys j WHERE j.destination_station_id=s.id AND j.checked_out_at>=? AND j.checked_out_at<DATE_ADD(?,INTERVAL 1 DAY)) AS exits
 FROM stations s JOIN `lines` l ON l.id=s.line_id WHERE (? IS NULL OR s.id=?) ORDER BY l.id,s.order_index', [$from,$to,$from,$to,$stationId,$stationId]);
respond(true, 'Lưu lượng vào/ra ga.', $rows);
