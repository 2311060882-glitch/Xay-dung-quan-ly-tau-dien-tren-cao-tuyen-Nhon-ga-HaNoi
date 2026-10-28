<?php
require_once __DIR__ . '/../../../helpers/journeys.php';
require_method('GET');
require_admin();
[$page,$size,$offset] = pagination();
$total = (int) fetch_one_row('SELECT COUNT(*) AS total FROM journeys')['total'];
// Sap xep theo lan quet cuoi, bao gom ca luot vua check-out.
$rows = fetch_all_rows('SELECT j.id,j.ticket_id,u.fullname,os.name AS origin_station_name,ds.name AS destination_station_name,j.checked_in_at,j.checked_out_at FROM journeys j JOIN tickets t ON t.id=j.ticket_id JOIN users u ON u.id=t.user_id JOIN stations os ON os.id=j.origin_station_id LEFT JOIN stations ds ON ds.id=j.destination_station_id ORDER BY COALESCE(j.checked_out_at,j.checked_in_at) DESC,j.id DESC LIMIT ? OFFSET ?', [$size,$offset]);
respond(true, 'Lịch sử quét gần nhất.', paged($rows,$total,$page,$size));
