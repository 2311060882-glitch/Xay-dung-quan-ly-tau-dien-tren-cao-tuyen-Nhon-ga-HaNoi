<?php

require_once __DIR__ . '/../../helpers/api.php';
require_method('GET');
$tripId = route_id();
$trip = fetch_one_row('SELECT tr.*,l.name AS line_name FROM trips tr JOIN `lines` l ON l.id=tr.line_id WHERE tr.id=?', [$tripId]);
if (!$trip) {
    respond(false, 'Không tìm thấy chuyến tàu.', null, 404);
}

respond(true, 'Lấy chi tiết chuyến thành công.', $trip);
